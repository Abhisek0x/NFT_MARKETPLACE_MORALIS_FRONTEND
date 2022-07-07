import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
	if (fullStr.length <= strLen) return fullStr;

	const separator = "...";
	const separatorLength = separator.length;
	const charToshow = strLen - separatorLength;
	const frontChars = Math.ceil(charToshow / 2);
	const backChars = Math.floor(charToshow / 2);

	return (
		fullStr.substring(0, frontChars) +
		separator +
		fullStr.substring(fullStr.length - backChars)
	);
};

function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
	const { isWeb3Enabled, account } = useMoralis();
	const [imageURI, setImageURI] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [tokenDescription, setTokenDescription] = useState("");
	const [showModal, setShowModal] = useState(false);
	const hideModal = () => setShowModal(false);
	const dispatch = useNotification();

	const { runContractFunction: buyItem } = useWeb3Contract({
		abi: nftMarketplaceAbi,
		contractAddress: marketplaceAddress,
		functionName: "buyItem",
		msgValue: price,
		params: {
			nftAddress: nftAddress,
			tokenId: tokenId,
		},
	});

	const { runContractFunction: getTokenURI } = useWeb3Contract({
		abi: nftAbi,
		contractAddress: nftAddress,
		functionName: "tokenURI",
		params: {
			tokenId: tokenId,
		},
	});

	async function updateUI() {
		const tokenURI = await getTokenURI();
		console.log(`TokenURI is ${tokenURI}`);
		if (tokenURI) {
			const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
			const tokenURIResponse = await (await fetch(requestURL)).json();
			const imageURI = tokenURIResponse.image;
			const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");

			setImageURI(imageURIURL);
			setTokenName(tokenURIResponse.name);
			setTokenDescription(tokenURIResponse.description);
		}
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const isOwnedByUser = seller === account || seller === undefined;
	const formattedsellerAddress = isOwnedByUser
		? "you"
		: truncateStr(seller || "", 15);

	const handleCardClick = () => {
		isOwnedByUser
			? setShowModal(true)
			: buyItem({
					onError: (error) => console.log(error),
					onSuccess: handleBuyItemSuccess,
			  });
	};

	const handleBuyItemSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: "success",
			message: "Item Bought",
			title: "Item Bought",
			position: "topR",
		});
	};

	return (
		<div>
			<div>
				{imageURI ? (
					<div>
						<UpdateListingModal
							isVisible={showModal}
							tokenId={tokenId}
							marketplaceAddress={marketplaceAddress}
							nftAddress={nftAddress}
							onClose={hideModal}
						/>
						<Card
							title={tokenName}
							description={tokenDescription}
							onClick={handleCardClick}
						>
							<div className="p-2">
								<div className="flex flex-col items-end gap-2">
									<div>#{tokenId}</div>
									<div className="italic text-sm">
										Owned by {formattedsellerAddress}
									</div>
									<Image
										loader={() => imageURI}
										src={imageURI}
										height="200"
										width="200"
									/>
									<div className="font-bold">
										{ethers.utils.formatUnits(price, "ether")} ETH
									</div>
								</div>
							</div>
						</Card>
					</div>
				) : (
					<div>Loading....</div>
				)}
			</div>
		</div>
	);
}

export default NFTBox;
