// All external Url API endpoints will be stored and exported from here
const devUrl = "http://localhost:4500/api";
const prodUrl = "https://sea-turtle-app-saw4n.ondigitalocean.app/api";

// export const server = process.env.NODE_ENV === "development" ? devUrl : prodUrl;
const server = prodUrl;
export const TrxDetails = `${server}/payment-link/fetch-link-details`;

export const UpdateTrxDetails = `${server}/payment-link/update-link`;
