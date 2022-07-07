import React from "react";
import { Form, Button } from "web3uikit";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import { useNotification } from "web3uikit";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";

function sellitem() {
	const { chainId, account, isWeb3Enabled } = useMoralis();
	const chainString = chainId ? parseInt(chainId).toString() : "31337";
	const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
	const { runContractFunction } = useWeb3Contract();
	const dispatch = useNotification();
	const [profits, setProfits] = useState("0");

	async function approveAndList(data) {
		console.log("Approving");
		const nftAddress = data.data[0].inputResult;
		const tokenId = data.data[1].inputResult;
		const price = ethers.utils
			.parseUnits(data.data[2].inputResult, "ether")
			.toString();

		const approveOptions = {
			abi: nftAbi,
			contractAddress: nftAddress,
			functionName: "approve",
			params: {
				to: marketplaceAddress,
				tokenId: tokenId,
			},
		};

		await runContractFunction({
			params: approveOptions,
			onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
			onError: (error) => {
				console.log(error);
			},
		});
	}

	async function handleApproveSuccess(nftAddress, tokenId, price) {
		console.log("Listing");
		const listOptions = {
			abi: nftMarketplaceAbi,
			contractAddress: marketplaceAddress,
			functionName: "listItem",
			params: {
				nftAddress: nftAddress,
				tokenId: tokenId,
				price: price,
			},
		};

		await runContractFunction({
			params: listOptions,
			onSuccess: handleListSuccess,
			onError: (error) => console.log(error),
		});
	}

	async function handleListSuccess(tx) {
		await tx.wait(1);
		dispatch({
			type: "success",
			message: "NFT Listed",
			title: "NFT Listed",
			position: "topR",
		});
	}

	const handleWithdrawSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: "success",
			message: "Withdrawing proceeds",
			position: "topR",
		});
	};

	async function setupUI() {
		const returnedProfits = await runContractFunction({
			params: {
				abi: nftMarketplaceAbi,
				contractAddress: marketplaceAddress,
				functionName: "getProfits",
				params: {
					seller: account,
				},
			},
			onError: (error) => console.log(error),
		});
		if (returnedProfits) {
			setProfits(returnedProfits.toString());
		}
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			setupUI();
		}
	}, [profits, account, isWeb3Enabled, chainId]);

	return (
		<div>
			<Form
				onSubmit={approveAndList}
				data={[
					{
						name: "NFT Address",
						type: "text",
						inputWidth: "50%",
						value: "",
						key: "nftAddress",
					},
					{
						name: "Token ID",
						type: "number",
						value: "",
						key: "tokenId",
					},

					{
						name: "PRICE (in ETH)",
						type: "number",
						value: "",
						key: "price",
					},
				]}
				title="Sell your NFT!"
				id="Main Form"
			></Form>

			<div className=" text-2xl mt-5 ml-5 font-extrabold">
				Withdraw your profits
			</div>
			<div className=" ml-5 mt-10 mb-5">
				Withdraw {ethers.utils.formatUnits(profits, "ether").toString()} ETH of
				profits by selling NFTs
			</div>
			<div className="ml-5">
				{profits != "0" ? (
					<Button
						onClick={() => {
							runContractFunction({
								params: {
									abi: nftMarketplaceAbi,
									contractAddress: marketplaceAddress,
									functionName: "withdrawProfits",
									params: {},
								},
								onError: (error) => console.log(error),
								onSuccess: handleWithdrawSuccess,
							});
						}}
						text="Withdraw"
						type="button"
					/>
				) : (
					<div>No profits detected</div>
				)}
			</div>
		</div>
	);
}

export default sellitem;
