
function initIronman(callback) {
    document.addEventListener('ironmanLoaded', ironmanExtension => {
        console.log('extension load');
        $('#createToken').length && $('#createToken').prop('disabled', false);
        $('#sendToken').length && $('#sendToken').prop('disabled', false);

        const ironman = window.ironman;
        //防止别的网页应用 调用window.ironman 对象
        window.ironman = null;
        // If you want to require a specific version of Scatter
        ironman.requireVersion(1.1);
        const enuNetwork = {
            blockchain: 'enu',
            chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
        }
        //给用户推荐网络， 第一次需要授权
        //ironman.suggestNetwork(enuNetwork);
        // ironman.getIdentity 用户授权页面
        ironman.getIdentity({
            accounts: [enuNetwork]
        }).then(
            identity => {
                //1. 用户授权完成后，获取用户的ENU帐号名字（12位长度），传给后台完成登录or注册操作操作
                const account = identity.accounts.find(acc => acc.blockchain === 'enu');
                console.log("1. 用户授权完成后，获取用户信息，提交给后台完成用户登录or注册", identity);
                //ENU参数，仅签名不广播交易
                const enuOptions = {
                    broadcast: true,
                    chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
                }
                var accountName = account.name;
                $('#inputAccount').val(accountName);
                $('#inputSender').val(accountName);
                //获取ENU instance
                const enu = ironman.enu(enuNetwork, Enu, enuOptions, "https");
                const requiredFields = {
                    accounts: [enuNetwork]
                };
                var arrTokenBalance = []
                enu.getTableRows({
                    code: "tokencreator",
                    scope: accountName,
                    table: "accounts",
                    limit: 500,
                    json: true
                  }).then(table => {
                    let length = table.rows.length;
                    $("#tokenSel").empty();
                    var opts = "";
                    
                    for(let i=0;i<length;i++ ){
                        var balance = table.rows[i].balance;
                        var symbol = balance.split(" ")[1];
                        arrTokenBalance.push(balance.split(" ")[0]);
                        opts += "<option value='"+i+"'>"+symbol+"</option>";
                    }
                    $("#tokenSel").append(opts);
                    $("#tokenSel").selectpicker('refresh');
                });
                callback(ironman, enu, requiredFields, account, arrTokenBalance);
        }).catch(e => {
            console.log("error", e);
        });
                
    });
}


function getAccountBalance(enu, account) {
    if (!enu || !account || !account.name) {
        return Promise.reject('Missing enu or account');
    } else {
        return enu.getTableRows({
            code: 'enu.token',
            scope: account.name,
            table: 'accounts',
            limit: 2,
            json: true
        }).then(table => {
            console.log('balance tables: ', table);
            if (table && table.rows && table.rows[0] && table.rows[0].balance) {
                let balance = table.rows[0].balance;
                $('#j_accountInfo').show();
                $('#j_accountName').html(account.name);
                $('#j_accountBalance').html(balance);
            } else {
                return Promise.reject('Get balance error');
            }
        });
    }
}

function formatENU(num) {
    num = parseFloat(num).toFixed(4) + ' ENU';
    return num;
}

function isNumeric(num) {
    return !isNaN(num)
}