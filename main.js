const dapp = "WaxCPULoan";
const endpoint = "testnet.wax.pink.gg";
const chainId =
  "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12";
const tokenContract = { WAX: "eosio.token" };
const menuPrices = [1, 2, 4];
const pools = [
  {
    name: "Pool 1",
    url: "https://namanahuja15.github.io/cpu-stake/",
    contract: "cpuloanstak1",
  },
  {
    name: "Pool 2",
    url: "https://namanahuja15.github.io/cpu-stake/SecondPool/",
    contract: "cpuloantests",
  },
  {
    name: "Pool 3",
    url: "https://namanahuja15.github.io/cpu-stake/ThirdPool/",
    contract: "cpuloantests",
  },
  {
    name: "Pool 4",
    url: "https://namanahuja15.github.io/cpu-stake/FourthPool/",
    contract: "cpuloantests",
  },

  //{ name: "x2 pool", url: "/x2pool/", contract: "x2waxcpuloan" },
];

var anchorAuth="owner";

main();
async function main() {
  loggedIn = false;
  configPromise = GetConfig();
  config = await configPromise;
  resultPromise=GetResults();
  results=await resultPromise;
  console.log(config);
  console.log(results);


    //freeSpace = await GetFreeSpace();


    PopulateResultList();
    autoLogin();

    
 checkuser=GetAuthUsers();
 checkauth= await checkuser;
 var isauth=false;
 for(i=0;i<checkauth.length;i++)
 {
   if(checkauth[i].account==wallet_userAccount)
   isauth=true;
 }

 if(isauth)
   ShowAdminControls();
 else
 {
  PopulateMenu();
 }
 
    //document.getElementById("timeinput").oninput = TimeInputChanged;
}

async function announcespin(id) {
  current=config[id];
  console.log(current);

  if (loggedIn) {
    HideMessage();
    try {
      const result = await wallet_transact([
        {
          account: contract,
          name: "announcespin",
          authorization: [{ actor: wallet_userAccount, permission: anchorAuth }],
          data: {
            id: current.giveaway_id
          },
        },
      ]);
      ShowMessage(
        '<div class="complete">Success</div><div class="link"><a href="https://wax.bloks.io/transaction/' +
          result.transaction_id +
          '?tab=traces">View transaction</a></div>'
      );
    } catch (e) {
      ShowToast(e.message);
    }
  } else {
    WalletListVisible(true);
  }

}

async function join(id) {
  current=config[id];
  console.log(current);

  if (loggedIn) {
    HideMessage();
    var amount = 1 + " " + "WAX";
    try {
      const result = await wallet_transact([
        {
          account: current.gv_contract,
          name: "transfer",
          authorization: [{ actor: wallet_userAccount, permission: anchorAuth }],
          data: {
            from: wallet_userAccount,
            to: contract,
            quantity: current.entrycost,
            memo: current.giveaway_id,
          },
        },
      ]);
      ShowMessage(
        '<div class="complete">Success</div><div class="link"><a href="https://wax.bloks.io/transaction/' +
          result.transaction_id +
          '?tab=traces">View transaction</a></div>'
      );
    } catch (e) {
      ShowToast(e.message);
    }
  } else {
    WalletListVisible(true);
  }

}

async function GetAuthUsers() {
  var path = "/v1/chain/get_table_rows";
  // var data = JSON.stringify({ json: true, code: "nftgamerstkt", scope:"nftgamerstkt", table: "unboxtickets",key_type: `i64`,index_position:'2',lower_bound:'4732050217762867280',upper_bound:"",limit: 100 });
  /*const response = await wax.rpc.get_table_rows({
       json: true,
        code: contract,
        scope: contract,
        table: 'config',
        limit: 1
      });*/
  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "authusers",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();

  let auth_users=[]; 
  for(i=0;i<body.rows.length;i++)
  {
    auth_users.push({
      account: body.rows[i].account,  
      giveaways_perday: body.rows[i].giveaways_perday,  
      day_start_time: body.rows[i].day_start_time,
      giveaways_today:body.rows[i].giveaways_today
    });
  }

  if (auth_users.length >= 1) { 
    return auth_users;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */


}

async function GetResults() {
  var path = "/v1/chain/get_table_rows";
  // var data = JSON.stringify({ json: true, code: "nftgamerstkt", scope:"nftgamerstkt", table: "unboxtickets",key_type: `i64`,index_position:'2',lower_bound:'4732050217762867280',upper_bound:"",limit: 100 });
  /*const response = await wax.rpc.get_table_rows({
       json: true,
        code: contract,
        scope: contract,
        table: 'config',
        limit: 1
      });*/
  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "results",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();

  let results=[]; 
  for(i=0;i<body.rows.length;i++)
  {
    results.push({
      giveaway_id: parseInt(body.rows[i].giveaway_id ),
      asset_id:body.rows[i].asset_id ,
      winner:body.rows[i].winner,
      roll_time:body.rows[i].roll_time,
    });
  }

  if (body.rows && Array.isArray(body.rows) && body.rows.length >= 1) { 
    return results;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */


}

async function GetAssets(assetIDs) {
  let results=[];

  for(i=0;i<assetIDs.length;i++)
  {

    var path = "atomicassets/v1/assets/"+assetIDs[i];
  // var data = JSON.stringify({ json: true, code: "nftgamerstkt", scope:"nftgamerstkt", table: "unboxtickets",key_type: `i64`,index_position:'2',lower_bound:'4732050217762867280',upper_bound:"",limit: 100 });
  /*const response = await wax.rpc.get_table_rows({
       json: true,
        code: contract,
        scope: contract,
        table: 'config',
        limit: 1
      });*/


  const response = await fetch("https://" + "test.wax.api.atomicassets.io/" + path, {
    headers: { "Content-Type": "text/plain" },
    method: "POST",
  });

  const body = await response.json();

    results.push({
      asset_id: parseInt(body.data.asset_id ),
      img:body.data.data.img 
    });
}

  if (results.length>0) { 
    return results;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */
}

async function GetConfig() {
  var path = "/v1/chain/get_table_rows";
  // var data = JSON.stringify({ json: true, code: "nftgamerstkt", scope:"nftgamerstkt", table: "unboxtickets",key_type: `i64`,index_position:'2',lower_bound:'4732050217762867280',upper_bound:"",limit: 100 });
  /*const response = await wax.rpc.get_table_rows({
       json: true,
        code: contract,
        scope: contract,
        table: 'config',
        limit: 1
      });*/
  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "giveaways",
    limit: 150,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();
  console.log(body);

  let giveaways=[];
  for(i=0;i<body.rows.length;i++)
  {
    giveaways.push({
      giveaway_id: parseInt(body.rows[i].id),
      entrycost: body.rows[i].entrycost,
      account: body.rows[i].authorised_account,
      assets: body.rows[i].asset_ids,
      entrants: body.rows[i].accounts,
      max_acc_size: body.rows[i].max_users,
      last_roll: body.rows[i].last_roll,
      timer: body.rows[i].loop_seconds,
      templateID: body.rows[i].templateID,
      q_needed: body.rows[i].quantiy_req,
      gv_contract: body.rows[i].contract_account
    });
  }

  if (body.rows && Array.isArray(body.rows) && body.rows.length >= 1) { 
    return giveaways;
  } else {
    ShowToast("Unexpected response retrieving config");
    return { Valid: false };
  } /* */
}


function ShowAdminControls() {
  var controls = "";
  var symbol = "WAX";
  var menu ="";
  for (var index = 0; index < config.length; ++index) {
    console.log(config[index].account);
    if(config[index].account==wallet_userAccount  )
    {
    var disabled = config[index].assets.length>0? "" : " disabled";
    var date=Date.parse(config[index].last_roll);
    console.log(date);
    var ts = new Date(date);
    var disabled = config[index].assets.length>0? "" : " disabled";

    menu += '<div  class="menuentry"><table><tr>';
    menu += '<td class="stakeamount">' +"Giveaway ID "+ config[index].giveaway_id ;
    menu += '<br>'  +"By "+ config[index].account+
    '<br>' +"Entry cost  "+ config[index].entrycost +'<br>' + "Total entries " +config[index].entrants.length+" / "+config[index].max_acc_size
    +'<br>' +"assets in pool "+ config[index].assets.length +'<br>' + "Time to roll "+ ts.toLocaleString()+  "</td>"+
      '<tr><td><button id="spin' +
        index +
        '" class="buy" onclick=' +
        "announcespin(" +
        index +
        ")" +disabled+">Announce Spin "+
        "</button></td>";
    menu += "</tr></table></div>";
    }
  }
  document.getElementById("menu").innerHTML = menu;
}

function PopulateMenu() {
  var menu = "";
  var symbol = "WAX";
  for (var index = 0; index < config.length; ++index) {
    console.log(config[index].account);
    var disabled = config[index].assets.length>0? "" : " disabled";
    var date=Date.parse(config[index].last_roll);
    console.log(date);
    var ts = new Date(date);

    menu += '<div  class="menuentry"><table><tr>';
    menu += '<td class="stakeamount">' +"Giveaway ID "+ config[index].giveaway_id ;
    menu += '<br>'  +"By "+ config[index].account +
    '<br>' +"Entry cost  "+ config[index].entrycost +'<br>' + "Total entries " +config[index].entrants.length+" / "+config[index].max_acc_size
    +'<br>' +"assets in pool "+ config[index].assets.length +'<br>' + "Time to roll "+ ts.toLocaleString()+  "</td>"+
    '<tr><td><button id="join' +
      index +
      '" class="buy" onclick=' +
      "join(" +
      index +
      ")" +">JOIN NOW "+
      "</button></td>"+
      '<tr><td><button id="see_assets' +
        index +
        '" class="buy" onclick=' +
        "seeassets(" +
        index +
        ")" +">See assets in pool "+
        "</button></td>";
    menu += "</tr></table></div>";
  }
  document.getElementById("menu").innerHTML = menu;
}

function PopulateResultList() {
  var html = '<div  id="results">'+"RESULTS"+"<br>";

  for (var index = results.length-1; index >=0; --index) {
    html +=
      '<div  class="pools_td">'+
      "Giveaway ID: "+results[index].giveaway_id  +

      "<br>"+"Asset won: "+results[index].asset_id+
      "<br>"+"Winner: "+results[index].winner+
      "<br>"+"roll_time: "+results[index].roll_time+
      "</div>"+
      "<br>";

  }
  html += "</div>";
  document.getElementById("results").innerHTML = html;


}

async function seeassets(giveaway_id) {
  current=config[giveaway_id];

  const assetPromise=GetAssets(current.assets);
  const assets=await assetPromise;
  console.log(assets);
  var html = '<div  id="assets">'+"Assets in giveaway"+current.giveaway_id+"<br>";
  let src = "https://ipfs.wecan.dev/ipfs/";   

  for(i=0;i<assets.length;i++)
{
  id= "img"+assets[i].asset_id;
  html += "<div id=id>"+"AssetID "+assets[i].asset_id+"<br>";
  var img = document.createElement('img');
  img.src = src + assets[i].img;
  document.getElementById('assets').appendChild(img);
  html += "</div>";


}
html += "</div>";
  document.getElementById("assets").innerHTML = html;
}

function CustomInputChanged() {
  var element = document.getElementById("custominput");
  element.value = parseInt(element.value);
  var valid = element.value > 0;
  var timeMultiplier = GetTimeMultiplier();
  document.getElementById("customamount").innerHTML =
    (timeMultiplier * element.value) / config.Multiplier;
  document.getElementById("buy" + menuPrices.length).disabled = !valid;
}

function TimeInputChanged() {
  var textValue = document.getElementById("timeinput").value;
  if (textValue.length > 0) {
    var value = parseInt(textValue);
    if (value < 1) {
      value = 1;
    }
    document.getElementById("timeinput").value = value;
    document.getElementById("timeunit").innerHTML = value > 1 ? "days" : "day";
  }
  var oldCustom = document.getElementById("custominput").value;
  PopulateMenu();
  document.getElementById("custominput").value = oldCustom;
  CustomInputChanged();
}
function GetTimeMultiplier() {
  var textValue = document.getElementById("timeinput").value;
  if (textValue.length > 0) {
    var timeMultiplier = parseInt(textValue);
    if (timeMultiplier < 1) {
      timeMultiplier = 1;
    }
    return timeMultiplier;
  } else {
    return 1;
  }
}
function WalletListVisible(visible) {
  document.getElementById("walletlist").style.visibility = visible
    ? "visible"
    : "hidden";
}
function ShowMessage(message) {
  document.getElementById("messagecontent").innerHTML = message;
  document.getElementById("message").style.visibility = "visible";
}
function HideMessage(message) {
  document.getElementById("message").style.visibility = "hidden";
}



function CalcDecimals(quantity) {
  var dotPos = quantity.indexOf(".");
  var spacePos = quantity.indexOf(" ");
  if (dotPos != -1 && spacePos != -1) {
    return spacePos - dotPos - 1;
  }
  return 0;
}

async function GetFreeSpace() {
  for (var index = 0; index < pools.length; index++) {
    var path = "/v1/chain/get_table_rows";
    var data = JSON.stringify({
      json: true,
      code: "eosio.token",
      scope: pools[index].contract,
      table: "accounts",
      lower_bound: "WAX",
      upper_bound: "WAX",
      limit: 1,
    });
    const response = await fetch("https://" + endpoint + path, {
      headers: { "Content-Type": "text/plain" },
      body: data,
      method: "POST",
    });
    const body = await response.json();
    if (body.rows && Array.isArray(body.rows) && body.rows.length == 1) {
      pools[index].freeSpace = Math.floor(parseFloat(body.rows[0].balance));
      if (pools[index].contract == contract) {
        document.getElementById("freevalue").innerHTML =
          pools[index].name +
          ": " +
          pools[index].freeSpace +
          " WAX" +
          " available";
      }
    } else {
      ShowToast("Unexpected response retrieving balance");
    }
  }
}

function GetSymbol(quantity) {
  var spacePos = quantity.indexOf(" ");
  if (spacePos != -1) {
      return quantity.substr(spacePos + 1)
  }
  return ""
}

async function ShowToast(message) {
  var element = document.getElementById("toast");
  element.innerHTML = message;
  toastU = 0;
  var slideFrac = 0.05;
  var width = element.offsetWidth;
  var right = 16;
  var id = setInterval(frame, 1e3 / 60);
  element.style.right = -width + "px";
  element.style.visibility = "visible";
  function frame() {
    toastU += 0.005;
    if (toastU > 1) {
      clearInterval(id);
      element.style.visibility = "hidden";
    }
    p =
      toastU < slideFrac
        ? toastU / slideFrac / 2
        : 1 - toastU < slideFrac
        ? (1 - toastU) / slideFrac / 2
        : 0.5;
    element.style.right =
      (width + right) * Math.sin(p * Math.PI) - width + "px";
  }
}
async function autoLogin() {
  var isAutoLoginAvailable = await wallet_isAutoLoginAvailable();
  if (isAutoLoginAvailable) {
    login();
  }
}
async function selectWallet(walletType) {
  wallet_selectWallet(walletType);
  login();
}
async function logout() {
  wallet_logout();
  document.getElementById("loggedin").style.display = "none";
  document.getElementById("loggedout").style.display = "block";
  loggedIn = false;
  HideMessage();
}
async function login() {
  try {
    const userAccount = await wallet_login();
    ShowToast("Logged in as: " + userAccount);
    document.getElementById("accountname").innerHTML = userAccount;
    document.getElementById("loggedout").style.display = "none";
    document.getElementById("loggedin").style.display = "block";
    WalletListVisible(false);
    loggedIn = true;
  } catch (e) {
    document.getElementById("response").innerHTML = e.message;
  }
}
const wax = new waxjs.WaxJS("https://" + endpoint, null, null, false);
const anchorTransport = new AnchorLinkBrowserTransport();
const anchorLink = new AnchorLink({
  transport: anchorTransport,
  verifyProofs: true,
  chains: [{ chainId: chainId, nodeUrl: "https://" + endpoint }],
});
async function wallet_isAutoLoginAvailable() {
  var sessionList = await anchorLink.listSessions(dapp);
  if (sessionList && sessionList.length > 0) {
    useAnchor = true;
    return true;
  } else {
    useAnchor = false;
    return await wax.isAutoLoginAvailable();
  }
}


async function wallet_selectWallet(walletType) {
  useAnchor = walletType == "anchor";
}
async function wallet_login() {
  if (useAnchor) {
    var sessionList = await anchorLink.listSessions(dapp);
    if (sessionList && sessionList.length > 0) {
      wallet_session = await anchorLink.restoreSession(dapp);
    } else {
      wallet_session = (await anchorLink.login(dapp)).session;
    }
    wallet_userAccount = String(wallet_session.auth).split("@")[0];
    auth=String(wallet_session.auth).split("@")[1];
    console.log(auth);
    anchorAuth=auth;
    //console.log(anchorAuth);    

  } else {
    wallet_userAccount = await wax.login();
    wallet_session = wax.api;
    anchorAuth="active";
  }
  return wallet_userAccount;
}
async function wallet_logout() {
  if (useAnchor) {
    await anchorLink.clearSessions(dapp);
  }
}
async function wallet_transact(actions) {
  if (useAnchor) {
    var result = await wallet_session.transact(
      { actions: actions },
      { blocksBehind: 3, expireSeconds: 30 }
    );
    result = { transaction_id: result.processed.id };
  } else {
    var result = await wallet_session.transact(
      { actions: actions },
      { blocksBehind: 3, expireSeconds: 30 }
    );
  }
  return result;
}
