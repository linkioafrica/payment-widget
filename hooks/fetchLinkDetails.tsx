import { useEffect, useState } from "react";
import axios from "axios";
import { TrxDetails } from "@/www";

export const useFetchLinkDetails = (checkout_id: any) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const response = await axios.get(TrxDetails, {
          params: { checkout_id },
        });
        setData(response.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    if (checkout_id) {
      fetchLinkDetails();
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 500);
      setError("Checkout Id not found");
    }
  }, [checkout_id]);

  return { data, error, loading };
};
