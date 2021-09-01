const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {  // this test is reproduced, more in depth, bellow
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', 'S1', tokenId, {from: accounts[0]});
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    // the test simply enssures no exceptions are thrown during creation and access of star token.
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'AS1', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS1', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS1', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS1', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    
    // 1. create a Star with different tokenId
    let tokenId = 6;
    let name = "Sirius 6";
    let symbol = "S6";
    await instance.createStar(name, symbol, tokenId, {from: accounts[0]});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(name,  star.name, "wrong name saved");
    assert.equal(symbol, star.symbol, "wrong symbol saved");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();

    let owner1 = accounts[1];
    let owner2 = accounts[2];

    // 1. create 2 Stars with different tokenId
    let tokenId1 = 11;
    let tokenId2 = 12;
    
    await instance.createStar("Star 11","S11", tokenId1, {from: owner1});
    await instance.createStar("Star 12","S12", tokenId2, {from: owner2});


    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, {from: owner1});

    // 3. Verify that the owners changed
    let currentOwnerStar1 = await instance.ownerOf(tokenId1);
    let currentOwnerStar2 = await instance.ownerOf(tokenId2);

    assert.equal(currentOwnerStar1, owner2, 'wrong owner for Star1');
    assert.equal(currentOwnerStar2, owner1, 'wrong owner for Star2');



});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let originalOwner = accounts[1];
    let newOwner = accounts[2];
    let tokenId = 7;
    let name = "Sirius 7";
    let symbol = "S7";
    await instance.createStar(name, symbol, tokenId, {from: originalOwner});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(newOwner, tokenId, {from: originalOwner});

    // 3. Verify the star owner changed.

    let currentOwner = await instance.ownerOf(tokenId);
    assert.equal(currentOwner, newOwner, 'wrong owner');

});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let tokenId = 8;
    let name = "Sirius 8";
    let symbol = "S8";
    await instance.createStar(name, symbol, tokenId);

    // 2. Call your method lookUptokenIdToStarInfo
    let starInfo = await instance.lookUptokenIdToStarInfo(tokenId);
    
    // 3. Verify if you Star name is the same
    let expectedInfo = 'Sirius 8';
    assert.equal(starInfo, expectedInfo, 'incorrect start info');

});