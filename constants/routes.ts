import { Address } from "viem"

export const QUOTERS: {[network:string]: Address} = {
    "Base": "0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0"
}

export const ROUTERS: {[network:string]: Address} = {
    "Base": "0x1fB93c553aC2B3B79fBAfd9dA04290B3339AEAEf"
}

export const ROUTES: {[network:string]: (string | number)[][]} = {
    "Base": [
        ["USDC", 1, "EURC"],
        ["USDC", 10, "BRZ"],
        ["USDC", 10, "ZARP"],
        ["USDC", 10, "IDRX"],
        ["USDC", 10, "CADC"],
        ["USDC", 10, "MXNE"],
        ["USDC", 10, "TRYB"],
        ["USDC", 10, "NZDD"],
    ]
}