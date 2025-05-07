import { Address } from "viem"

export const QUOTERS: {[network:string]: Address} = {
    "Base": "0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0"
}

export const ROUTERS: {[network:string]: Address} = {
    "Base": "0x6Cb442acF35158D5eDa88fe602221b67B400Be3E"
}

export const ROUTES: {[network:string]: (string | number)[][]} = {
    "Base": [
        ["USDC", 1, "EURC"],
        ["EURC", 1, "USDC"],
        ["BRZ", 10, "USDC"],
        ["BRZ", 10, "USDC", 1, "EURC"],
        ["ZARP", 10, "USDC"],
        ["ZARP", 10, "USDC", 1, "EURC"],
        ["IDRX", 10, "USDC"],
        ["IDRX", 10, "USDC", 1, "EURC"],
    ]
}