async function getStaticProps() {
  const res = await axios.get("./stb.json");
  // console.log(res);
  // console.log(res.data[0].product_name);
  // console.log(res.data[0].catchcopy);
  // console.log(res.data[0].price);

  const starBucks = document.querySelector("#stbLine");

  // console.log(starBucks);

  for (let i = 0; i < 98; i++) {
    const stbLineup = document.createElement("span");
    const stbName = document.createElement("div");
    const stbCatchcopy = document.createElement("div");
    const stbPrice = document.createElement("div");
    const stbImage = document.createElement("img");

    stbName.innerHTML = res.data[i].product_name;
    stbCatchcopy.innerHTML = res.data[i].catchcopy;

    stbPrice.innerHTML = res.data[i].price + "円";
    stbImage.src = `https://product.starbucks.co.jp${res.data[i].image1}`;
    stbLineup.appendChild(stbName);
    stbLineup.appendChild(stbCatchcopy);
    stbLineup.appendChild(stbPrice);
    stbLineup.appendChild(stbImage);

    starBucks.appendChild(stbLineup);
  }
}
getStaticProps();

//----------------------------------------------------------------------
// 定数
//----------------------------------------------------------------------
// 名前、金額、初期投入枚数、投入限界枚数
const COIN = [
  ["1000円", 1000, 10, 20],
  ["500円", 500, 10, 20],
  ["100円", 100, 10, 20],
  ["50円", 50, 10, 20],
  ["10円", 10, 10, 20],
];

// 名前、金額、初期投入個数、投入限界枚数
const DRINK = [
  ["焼き芋ブリュレ", 610, 10, 100],
  ["クリームブリュレ", 620, 10, 100],
  ["ストロベリー", 630, 10, 100],
  ["メロンofメロン", 640, 10, 100],
  ["チョコレート", 650, 10, 100],
  ["ジンジャーブレッド", 660, 10, 100],
];

// 飲み物の金額表示
const DISP_DRINK = [
  "#disp-item1",
  "#disp-item2",
  "#disp-item3",
  "#disp-item4",
  "#disp-item5",
  "#disp-item6",
];
const DISP_NUMBER_DIGITS = 3;
const DISP_INSERT = "#disp-insert"; // 投入金額表示
const DISP_CHARGE = "#disp-charge"; // お釣り金額表示

const MAX_INPUT_AMOUNT = 10000; // 投入上限金額
const NO_OPERATION_TIMER = 10000; // 無操作タイマー

// ドリンク管理
class Item {
  #itemName = ""; // 名前
  #price = 0; // 金額
  constructor(itemName, price) {
    this.#itemName = itemName;
    this.#price = price;
  }
  get itemName() {
    return this.#itemName;
  } // 名前取得
  get price() {
    return this.#price;
  } // 金額取得
  set itemName(v) {
    this.#itemName = v;
  } // 名前設定
  set price(v) {
    this.#price = Number(v);
  } // 金額設定
}

// ドリンクストック管理
class ItemSlot {
  #item; // ドリンク
  #stock; // 投入数
  #capacity; // キャパ
  constructor(item, stock, capacity) {
    this.#item = item;
    this.#stock = stock;
    this.#capacity = capacity;
  }
  get item() {
    return this.#item;
  } // アイテム取得
  get stock() {
    return this.#stock;
  } // 在庫数取得
  set item(v) {
    this.#item = v;
  } // アイテム設定
  set stock(v) {
    this.#stock += Number(v);
  } // 在庫数 加減算
  isEmpty() {
    return this.#stock <= 0 ? true : false;
  } // 在庫があるかどうか ture（有り）/ false(無し)
  isFull() {
    return this.#stock >= this.#capacity ? true : false;
  } // 在庫オーバー ture（オーバー）/ false(平気)
}

// ドリンク統括
class ItemManager {
  #slots = []; // ドリンクスロット
  constructor() {
    this.#slots = [];
  }
  set slots(v) {
    this.#slots[this.#slots.length] = v;
  } // スロットの追加
  getItemPrice(i) {
    return this.#slots[i].item.price;
  } // アイテム金額取得
  getItemName(i) {
    return this.#slots[i].item.itemName;
  } // アイテム販売金額取得
  getItemStock(i) {
    return this.#slots[i].stock;
  } // 残数取得
  isBuy(index) {
    return this.#slots[index].isEmpty() ? false : true;
  } //購入可能か？
  purchase(index) {
    this.#slots[index].stock = -1;
  } // ストックの減算
  debugPrint() {
    let result = "";
    this.#slots.forEach((s) => {
      result += `${s.item.itemName}:${s.stock}本<br>`;
    });
    return result;
  }
}

// お金
class Coin {
  #itemName; // 名前
  #amount; // 金額
  constructor(itemName, amount) {
    this.#itemName = itemName;
    this.#amount = amount;
  }
  get itemName() {
    return this.#itemName;
  } // 名前取得
  get amount() {
    return this.#amount;
  } // 金額取得
  set itemName(v) {
    this.#itemName = v;
  } // 名前設定
  set amount(v) {
    this.#amount = Number(v);
  } // 金額設定
}

// お金ストック管理
class CoinSlot {
  #coin; // お金
  #stock; // 投入数
  #capacity; // キャパ
  constructor(coin, stock, capacity) {
    this.#coin = coin;
    this.#stock = stock;
    this.#capacity = capacity;
  }
  get coin() {
    return this.#coin;
  }
  get amount() {
    return this.#coin.amount;
  }
  get stock() {
    return this.#stock;
  }
  set coin(v) {
    this.#coin = v;
  }
  set stock(v) {
    this.#stock += Number(v);
  }
  isEmpty() {
    return this.#stock <= 0 ? true : false;
  }
  isFull() {
    return this.#capacity <= 0 ? true : false;
  }
  calcRequired(v) {
    let result = 0;
    let s = Math.floor(v / this.#coin.amount);
    result = this.#stock >= s ? s : this.#stock;
    return result;
  }
}

// お金統括
class CashManager {
  #slots; // お金スロット
  #insertTotal; // 投入金額
  #chargeTotal; // お釣りの合計
  #chargeCoins; // お釣りの金種
  #limit; // 投入金額上限
  constructor(limit) {
    this.#slots = [];
    this.#insertTotal = 0;
    this.#chargeTotal = 0;
    this.#chargeCoins = [];
    this.#limit = limit;
  }
  get insertTotal() {
    return this.#insertTotal;
  }
  get chargeTotal() {
    return this.#chargeTotal;
  }
  set slots(v) {
    this.#slots[this.#slots.length] = v;
  }
  clear() {
    this.#insertTotal = 0;
  }
  chargeClear() {
    this.#chargeTotal = [];
    this.#chargeTotal = 0;
  }
  insertCoin(v) {
    let result = false;
    if (this.isOverflow(v))
      throw {
        name: "insert_overflow",
        message: "投入金額が上限を超えています｡",
      }; //入金できない1｡
    this.#slots.forEach((s) => {
      if (s.coin.amount === v) {
        if (s.isFull())
          throw {
            name: "full_coin_slot",
            message: "投入金種の金庫がいっぱいです!",
          }; //入金できない2｡
        this.#insertTotal += v;
        s.stock = 1;
        result = true;
      }
    });
    if (!result)
      throw {
        name: "unknown_coin",
        message: "使用できない金種が投入されました｡",
      }; //入金できない3｡
  }

  giveChange(price) {
    let temp = 0;
    this.#chargeCoins = [];
    this.#insertTotal -= price;
    this.#chargeTotal = this.#insertTotal;

    this.#slots.forEach((s) => {
      temp = s.calcRequired(this.#insertTotal);
      if (temp > 0) {
        this.#chargeCoins[this.#chargeCoins.length] = {
          coin: s.coin,
          stock: temp,
        };
        this.#insertTotal -= temp * s.amount;
        s.stock = -temp;
      }
    });
  }
  payment(price) {
    this.#insertTotal -= price;
  }
  isOverflow(v) {
    return this.#insertTotal + v >= this.#limit ? true : false;
  }
  isBuy(price) {
    return this.#insertTotal >= price ? true : false;
  }
  isLackChange(price) {
    let charge = this.#insertTotal - price;
    let temp;
    this.#slots.forEach((s) => {
      temp = s.calcRequired(charge);
      if (temp > 0) charge -= temp * s.amount;
    });
    return charge <= 0 ? true : false;
  }
  chargeInfo() {
    let result = "";
    this.#chargeCoins.forEach((s) => {
      result += `${s.coin.itemName}:${s.stock}枚 `;
    });
    return result;
  }
  debugPrint() {
    let result = "";
    this.#slots.forEach((s) => {
      result += `${s.coin.itemName}:${s.stock}枚<br>`;
    });
    return result;
  }
}
// デジタル数字表示
class DisplayNumber {
  #element;
  constructor(id) {
    this.#element = document.querySelector(id);
  }
  clear() {
    let use = this.#element.querySelectorAll("use");
    use.forEach((e) => {
      e.setAttribute("xlink:href", "#diginone");
    });
  }
  update(price) {
    let chars = price.toString().split("");
    let i = DISP_NUMBER_DIGITS;
    let use = this.#element.querySelectorAll("use");
    this.clear();
    do {
      use[i--].setAttribute("xlink:href", `#diginum${chars.pop()}`);
    } while (chars.length);
  }
}
// 自動販売機
class VendingMachine {
  #cashManager;
  #itemManager;
  #itemDisplay;
  #insertDisplay;
  #chargeDisplay;
  #infoData;
  constructor(cashManager, itemManager) {
    this.#cashManager = cashManager;
    this.#itemManager = itemManager;
    this.#itemDisplay = [];
    this.#chargeDisplay;
    this.#insertDisplay;
    this.#infoData = "";
  }
  get infoData() {
    return this.#infoData;
  }
  set itemDisplay(v) {
    this.#itemDisplay[this.#itemDisplay.length] = v;
  }
  set insertDisplay(v) {
    this.#insertDisplay = v;
  }
  set chargeDisplay(v) {
    this.#chargeDisplay = v;
  }
  update(key) {
    this.#infoData = "";
    this.#cashManager.chargeClear();
    switch (key) {
      case "coin1":
        this.#cashManager.insertCoin(10);
        break;
      case "coin2":
        this.#cashManager.insertCoin(50);
        break;
      case "coin3":
        this.#cashManager.insertCoin(100);
        break;
      case "coin4":
        this.#cashManager.insertCoin(500);
        break;
      case "coin5":
        this.#cashManager.insertCoin(1000);
        break;
      case "coin6":
        this.#cashManager.insertCoin(5000);
        break;
      case "item1":
        this.purchase(0);
        break;
      case "item2":
        this.purchase(1);
        break;
      case "item3":
        this.purchase(2);
        break;
      case "item4":
        this.purchase(3);
        break;
      case "item5":
        this.purchase(4);
        break;
      case "item6":
        this.purchase(5);
        break;
      case "lever":
        this.charge();
        break;
      default:
        break;
    }
  }
  charge() {
    this.#cashManager.giveChange(0);
    this.#infoData = this.#cashManager.chargeInfo();
  }
  purchase(index) {
    let result = [];
    let price = this.#itemManager.getItemPrice(index);
    let itemIsBuy = this.#itemManager.isBuy(index);
    let cashIsBuy = this.#cashManager.isBuy(price);
    let cashIsLackChange = this.#cashManager.isLackChange(price);

    if (itemIsBuy && cashIsBuy && cashIsLackChange) {
      this.#itemManager.purchase(index);
      this.#cashManager.payment(price);
      this.#infoData = `${this.#itemManager.getItemName(
        index
      )}を1個購入しました。(残り${this.#itemManager.getItemStock(index)}個）`;
    } else {
      if (!cashIsBuy)
        throw { name: "cash_shortage", message: "投入金額が足りません｡" };
      if (!itemIsBuy)
        throw {
          name: "inventory_shortage",
          message: "商品の在庫がありません｡",
        };
      if (!cashIsLackChange)
        throw { name: "lack_change", message: "お釣りがありません｡" };
    }
    return result;
  }
  dispUpdate() {
    this.#itemDisplay.forEach((v, i) => {
      if (this.#itemManager.getItemStock(i) > 0) {
        v.update(this.#itemManager.getItemPrice(i));
      } else {
        v.update("----");
      }
    });
    this.#insertDisplay.update(this.#cashManager.insertTotal);
    this.#chargeDisplay.update(this.#cashManager.chargeTotal);
  }
  debugChash() {
    return this.#cashManager.debugPrint();
  }
  debugItem() {
    return this.#itemManager.debugPrint();
  }
}
/**********************************************************************/
/* 初期設定                                                            */
/**********************************************************************/
let cashManager = new CashManager(MAX_INPUT_AMOUNT);
let itemManager = new ItemManager();
let vendingMachine = new VendingMachine(cashManager, itemManager);
let body = document.querySelector("body");
let info = document.querySelector("#info"); /* #debug */
let info2 = document.querySelector("#info2"); /* #debug */
let info3 = document.querySelector("#info3"); /* #debug */
let timer; //
let updateVendingMachine = (key) => {
  try {
    vendingMachine.update(key);
    vendingMachine.dispUpdate();
    info.innerHTML = vendingMachine.infoData; /* #debug */
  } catch (e) {
    info.innerHTML = e.message; /* #debug */
  } finally {
    info2.innerHTML = vendingMachine.debugItem(); /* #debug */
    info3.innerHTML = vendingMachine.debugChash(); /* #debug */
  }
};

// 金種設定
COIN.forEach((v) => {
  cashManager.slots = new CoinSlot(new Coin(v[0], v[1]), v[2], v[3]);
});

// 販売アイテム設定
DRINK.forEach((v) => {
  itemManager.slots = new ItemSlot(new Item(v[0], v[1]), v[2], v[3]);
});

// 電子数字ディスプレイを自動販売機に追加
DISP_DRINK.forEach((v) => {
  vendingMachine.itemDisplay = new DisplayNumber(v);
});
vendingMachine.insertDisplay = new DisplayNumber(DISP_INSERT);
vendingMachine.chargeDisplay = new DisplayNumber(DISP_CHARGE);

// 自動販売機の初期表示
vendingMachine.update(null);
vendingMachine.dispUpdate();

// ユーザーとの対話開始
body.addEventListener("click", (e) => {
  let el = e.target;

  /* 無操作タイマー */
  clearTimeout(timer);
  timer = setTimeout(() => {
    updateVendingMachine("lever");
  }, NO_OPERATION_TIMER);

  updateVendingMachine(el.dataset.key);
});
