const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');




async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields'
        });
    }

    const fromuseraccount = await accountModel.findById(fromAccount);
    const touseraccount = await accountModel.findById(toAccount);

    if (!fromuseraccount || !touseraccount) {
        return res.status(404).json({
            message: 'Account not found'
        });
    }

    const istransactionexist = await transactionModel.findOne({
        idempotencyKey
    });

    if (istransactionexist) {

        switch (istransactionexist.status) {

            case 'completed':
                return res.status(400).json({
                    message: 'Transaction already completed',
                    transaction: istransactionexist
                });

            case 'pending':
                return res.status(400).json({
                    message: 'Transaction is pending'
                });

            case 'failed':
                return res.status(400).json({
                    message: 'Transaction failed'
                });

            case 'reversed':
                return res.status(400).json({
                    message: 'Transaction reversed'
                });
        }
    }

    if (
        fromuseraccount.status !== 'active' ||
        touseraccount.status !== 'active'
    ) {
        return res.status(400).json({
            message: 'Account is not active'
        });
    }

    const balance = await fromuseraccount.getbalance();

    if (balance < amount) {
        return res.status(400).json({
            message: 'Insufficient balance'
        });
    }

    let session;
    let transaction;

    try {

        session = await mongoose.startSession();
        session.startTransaction();

        transaction = (
            await transactionModel.create([{
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: 'pending'
            }], { session })
        )[0];

        await ledgerModel.create([{
            account: fromAccount,
            type: 'debit',
            amount,
            transaction: transaction._id
        }], { session });

        // Simulate delay
        await new Promise(resolve =>
            setTimeout(resolve, 10000)
        );

        await ledgerModel.create([{
            account: toAccount,
            type: 'credit',
            amount,
            transaction: transaction._id
        }], { session });

        await transactionModel.findByIdAndUpdate(
            transaction._id,
            {
                status: 'completed'
            },
            { session }
        );

        await session.commitTransaction();

    } catch (err) {

        if (session) {
            await session.abortTransaction();
        }

        console.error(err);

        if (err.code === 11000) {
            return res.status(409).json({
                message:
                    'Transaction already exists with this idempotency key'
            });
        }

        return res.status(500).json({
            message: 'Transaction failed'
        });

    } finally {

        if (session) {
            await session.endSession();
        }
    }

    try {

        await emailService.sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount
        );

    } catch (emailError) {

        console.error(
            'Email sending failed:',
            emailError
        );

    }

    return res.status(201).json({
        message: 'Transaction completed',
        transaction
    });
}

async function initiateSystemTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const touseraccount = await accountModel.findOne({
        _id: toAccount
    });

    if (!touseraccount) {
        return res.status(404).json({ message: 'Account not found' });
    }

    
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id,
    });
    
    console.log("ACCOUNT:", fromUserAccount);
    
    if (!fromUserAccount) {
        return res.status(404).json({ message: 'System account not found' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const newTransaction = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount: touseraccount._id,
        amount: amount,
        idempotencyKey: idempotencyKey,
        status: 'pending'
    }], { session });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        type: 'debit',
        amount: amount,
        transaction: newTransaction[0]._id
    }], { session });

   
    const creditLedgerEntry = await ledgerModel.create([{
        account: touseraccount._id,
        type: 'credit',
        amount: amount,
        transaction: newTransaction[0]._id
    }], { session });

    newTransaction[0].status = 'completed';

    await newTransaction[0].save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: 'System transaction completed', transaction: newTransaction });

}




module.exports = {
    createTransaction,
    initiateSystemTransaction
}


