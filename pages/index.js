import styles from "../styles/Home.module.css";
import { useMoralisQuery, useTokenPrice } from "react-moralis";
import { NFTBalance } from "web3uikit";
import NFTBox from "../components/NFTBox";

export default function Home() {
	const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
		"ActiveItem",
		(query) => query.limit(10).descending("tokenId")
	);

	return (
		<div className="container mx-auto">
			<h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
			<div className="flex flex-wrap">
				{fetchingListedNfts ? (
					<div>Loading...</div>
				) : (
					listedNfts.map((nft) => {
						console.log(nft.attributes);
						const { price, nftAddress, tokenId, marketplaceAddress, seller } =
							nft.attributes;
						return (
							<div>
								<NFTBox
									price={price}
									nftAddress={nftAddress}
									tokenId={tokenId}
									marketplaceAddress={marketplaceAddress}
									seller={seller}
									key={`${nftAddress}${tokenId}`}
								/>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
