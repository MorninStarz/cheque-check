import customer from './customer/customer.service';
import customerSearch from './customer/search-customer/search-customer.service';
import user from './user/user.service';
import authen from './user/authenticate/authenticate.service';
import permission from './permission/permission.service';
import login_transaction from './login-transaction/login-transaction.service';
import bank from './bank/bank.service';
import branch from './branch/branch.service';
import get_customer from './info/get-customer/get-customer.service';
import get_bank from './info/get-bank/get-bank.service';
import get_branch from './info/get-branch/get-branch.service';
import cheque from './cheque/cheque.service';
import account from './account/account.service';
import get_account from './info/get-account/get-account.service';
import transfer from './transfer/transfer.service';
import transaction from './transaction/transaction.service';
import dashboard from './info/dashboard/dashboard.service';

module.exports = function (app) {
  app.configure(customer);
  app.configure(customerSearch);
  app.configure(permission);
  app.configure(user);
  app.configure(authen);
  app.configure(login_transaction);
  app.configure(bank);
  app.configure(branch);
  app.configure(get_customer);
  app.configure(get_bank);
  app.configure(get_branch);
  app.configure(cheque);
  app.configure(account);
  app.configure(get_account);
  app.configure(transfer);
  app.configure(transaction);
  app.configure(dashboard);
};
