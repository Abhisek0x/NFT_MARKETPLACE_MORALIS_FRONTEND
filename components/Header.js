import React from "react";
import { ConnectButton } from "web3uikit";
import Link from "next/link";

function Header() {
	return (
		<nav className="p-5 border-b-2 flex flex-row justify-between items-center">
			<h1 className="py-4 px-4 font-extrabold text-2xl hover:animate-pulse">
				NFT Marketplace
			</h1>
			<div className="flex flex-row items-center">
				<Link href="/">
					<a className="p-6 mr-4">Home</a>
				</Link>
				<Link href="sellitem">
					<a className="mr-4 p-6"> Sell NFTs</a>
				</Link>
				<ConnectButton />
			</div>
		</nav>
	);
}

export default Header;
