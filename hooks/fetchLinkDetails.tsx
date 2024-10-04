import { useEffect, useState } from "react";
import axios from "axios";
import { TrxDetails } from "@/www";
import { useRouter } from "next/navigation";

export const useFetchLinkDetails = (checkout_id: any) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const router = useRouter();

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
        setLoading(false);
      }
    };

    if (checkout_id) {
      fetchLinkDetails();
    } else {
      setLoading(false);
      console.log("Checkour Id not found");
      setError("Checkout Id not found");
    }
  }, [checkout_id]);

  return { loading, data, error };
};
