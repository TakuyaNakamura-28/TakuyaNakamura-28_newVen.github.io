const VendingMachine = require("./ven");
const { expect } = require("chai");
describe("vending machine", () => {
  it("投入金額、お釣りが正しく出せてる？", () => {
    // Setup
    const cash = new CashManager();
    // お釣りの計算
    cash.insertCoin(1000);
    cash.giveChange(650);
    expect(cash.chargeTotal).to.equal(350);
    // お釣りのリセット
    cash.chargeClear();
    expect(cash.chargeTotal).to.equal(0);
  });
  it("商品の在庫管理できてる？", () => {
    // Setup
    const drink = new ItemManager();
    // 商品の在庫
    drink.getItemStock("チョコレート");
    expect(drink.slots[i]).to.equal(10);
    // 購入後の在庫
    drink.purchase("チョコレート");
    expect(drink.slots[index]).to.equal(9);
  });
});
