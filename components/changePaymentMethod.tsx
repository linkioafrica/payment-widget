import { Icons } from "@/app/icons";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const ChangePaymentMethod = () => {
  const { isDrawerOpen, setIsDrawerOpen } = usePaymentLinkMerchantContext();
  return (
    <button
      className="text-sm flex items-center text-black dark:bg-[#141415] dark:text-[#F9F9F9] bg-[#F3F3F3] border-[0.7px] py-2 dark:border-[#242425] border-[#E2E3E7] px-2 rounded-md"
      onClick={() => {
        setIsDrawerOpen(!isDrawerOpen);
      }}
    >
      <i className="">{Icons.change}</i>
      Change payment method
    </button>
  );
};
