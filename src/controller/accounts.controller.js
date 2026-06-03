const accModel = require('../models/account.model');


async function createAccount(req, res) {

    const user = req.user;
    const account = await accModel.create({
    user: user._id,
});

return res.status(201).json({ message: 'Account created successfully', account });

}


async function getAccounts(req, res) {

    const user = req.user;
    const accounts = await accModel.find({ user: user._id });

    return res.status(200).json({ message: 'Accounts retrieved successfully', accounts });

}


async function getBalance(req, res) {

    const { accountId } = req.params;

    const account= await accModel.findOne({ _id: accountId, user: req.user._id });

    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    const bal= await account.getbalance();

    return res.status(200).json({ message: 'Balance retrieved successfully', balance: bal });

}

module.exports = {
    createAccount,
    getAccounts,
    getBalance
}