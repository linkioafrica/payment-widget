import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchLinkDetails = (checkout_id: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLinkDetails = async () => {
      console.log(checkout_id);
      try {
        const response = await axios.get(
          `https://seal-app-x3vn7.ondigitalocean.app/api/payment-link/fetch-link-details`,
          { params: { checkout_id } }
        );
        setData(response.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (checkout_id) {
      fetchLinkDetails();
    }
  }, [checkout_id]);

  return { loading, data, error };
};
