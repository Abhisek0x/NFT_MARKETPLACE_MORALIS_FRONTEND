Moralis.Cloud.afterSave("ItemListed", async (request) => {
	const confirmed = request.object.get("confirmed");
	const logger = Moralis.Cloud.getLogger();
	logger.info("Looking for confirmed tx");

	if (confirmed) {
		logger.info("Found Item");
		const ActiveItem = Moralis.Object.extend("ActiveItem");
		const activeItem = new ActiveItem();
		activeItem.set("marketplaceAddress", request.object.get("address"));
		activeItem.set("nftAddress", request.object.get("nftAddress"));
		activeItem.set("price", request.object.get("price"));
		activeItem.set("tokenId", request.object.get("tokenId"));
		activeItem.set("seller", request.object.get("seller"));

		logger.info(
			`Adding Address ${request.object.get(
				"address"
			)}, TokenID: ${request.object.get("tokenId")}`
		);
		logger.info("Saving......");

		await activeItem.save();
	}
});

Moralis.Cloud.afterSave("ItemListingUpdated", async (request) => {
	const confirmed = request.object.get("confirmed");
	const logger = Moralis.Cloud.getLogger();
	logger.info("Looking for confirmed tx");

	if (confirmed) {
		logger.info("Found Item");
		const ActiveItem = Moralis.Object.extend("ActiveItem");

		const query = new Moralis.Query(ActiveItem);
		query.equalTo("nftAddress", request.object.get("nftAddress"));
		query.equalTo("tokenId", request.object.get("tokenId"));
		query.equalTo("marketplaceAddress", request.object.get("address"));
		query.equalTo("seller", request.object.get("seller"));
		logger.info(`Marketplace | Query: ${query}`);
		const alreadyListedItem = await query.first();
		console.log(`alreadyListedItem ${JSON.stringify(alreadyListedItem)}`);
		if (alreadyListedItem) {
			logger.info(`Deleting already listed  ${request.object.get("objectId")}`);
			await alreadyListedItem.destroy();
			logger.info(
				`Deleted item with tokenId ${request.object.get(
					"tokenId"
				)} at address ${request.object.get(
					"address"
				)} since the listing is being updated. `
			);
		}

		const activeItem = new ActiveItem();
		activeItem.set("marketplaceAddress", request.object.get("address"));
		activeItem.set("nftAddress", request.object.get("nftAddress"));
		activeItem.set("price", request.object.get("newprice"));
		activeItem.set("tokenId", request.object.get("tokenId"));
		activeItem.set("seller", request.object.get("seller"));

		logger.info(
			`Adding Address ${request.object.get(
				"address"
			)}, TokenID: ${request.object.get("tokenId")}`
		);
		logger.info("Saving......");

		await activeItem.save();
	}
});

Moralis.Cloud.afterSave("ItemListingCancelled", async (request) => {
	const confirmed = request.object.get("confirmed");
	const logger = Moralis.Cloud.getLogger();
	logger.info(`Marketplace | Object: ${request.object}`);
	if (confirmed) {
		const ActiveItem = Moralis.Object.extend("ActiveItem");
		const query = new Moralis.Query(ActiveItem);
		query.equalTo("marketplaceAddress", request.object.get("address"));
		query.equalTo("nftAddress", request.object.get("nftAddress"));
		query.equalTo("tokenId", request.object.get("tokenId"));
		logger.info(`Marketplace | Query: ${query}`);
		const cancelledItem = await query.first();
		logger.info(
			`Marketplace | CancelledItem: ${JSON.stringify(cancelledItem)}`
		);
		if (cancelledItem) {
			logger.info(`Deleting ${cancelledItem.id}`);
			logger.info(
				`Deleted item with tokenId ${request.object.get(
					"tokenId"
				)} at address ${request.object.get("address")} since it was cancelled. `
			);
			await cancelledItem.destroy();
		} else {
			logger.info(
				`No item cancelled with address: ${request.object.get(
					"address"
				)} and tokenId: ${request.object.get("tokenId")} found.`
			);
		}
	}
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
	const confirmed = request.object.get("confirmed");
	logger.info(`Marketplace | Object: ${request.object}`);
	if (confirmed) {
		const logger = Moralis.Cloud.getLogger();
		const ActiveItem = Moralis.Object.extend("ActiveItem");
		const query = new Moralis.Query(ActiveItem);
		query.equalTo("marketplaceAddress", request.object.get("address"));
		query.equalTo("nftAddress", request.object.get("nftAddress"));
		query.equalTo("tokenId", request.object.get("tokenId"));
		logger.info(`Marketplace | Query: ${query}`);
		const boughtItem = await query.first();
		logger.info(`Marketplace | boughtItem: ${JSON.stringify(boughtItem)}`);
		if (boughtItem) {
			logger.info(`Deleting ${boughtItem.id}`);
			logger.info(
				`Deleted item with tokenId ${request.object.get(
					"tokenId"
				)} at address ${request.object.get("address")} since it was Bought. `
			);
			await boughtItem.destroy();
		} else {
			logger.info(
				`No item found with address: ${request.object.get(
					"address"
				)} and tokenId: ${request.object.get("tokenId")} found.`
			);
		}
	}
});
