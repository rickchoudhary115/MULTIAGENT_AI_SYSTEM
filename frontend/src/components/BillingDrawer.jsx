import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Crown, Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { setUserData } from "../redux/userSlice";

// Change these paths only if your files are located somewhere else.
import createOrder from "../features/createOrder.js";
import verifyPayment from "../features/verifyPayment.js";

/* =========================================================
   DISPLAY PLANS
   Backend Plans.js remains the source of truth.
   ========================================================= */

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    amount: 199,
    credits: 500,
    validity: 30,
    description: "For regular AI usage",
    features: ["500 credits", "Advanced AI access", "30 days validity"],
  },
  {
    id: "pro",
    name: "Pro",
    amount: 499,
    credits: 500,
    validity: 30,
    description: "For heavy AI usage",
    features: ["500 credits", "Priority AI access", "30 days validity"],
  },
];

/* =========================================================
   RAZORPAY
   ========================================================= */

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);

    const script = existing || document.createElement("script");

    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));

    if (!existing) {
      script.src = RAZORPAY_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });

/* =========================================================
   BILLING DRAWER
   ========================================================= */

function BillingDrawer({ open, onClose }) {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  /*
    Your Redux structure is:

    userData
      └── user
           ├── userId
           ├── name
           ├── email
           ├── avatar
           ├── plan
           ├── credits
           ├── totalCredits
           └── planExpiresAt
  */

  const user = userData?.user;

  /* =========================================================
     USER BILLING DATA
     ========================================================= */

  const credits = Number(user?.credits ?? 0);

  const totalCredits = Number(user?.totalCredits ?? 100);

  const currentPlan = user?.plan ?? "free";

  const creditPercentage =
    totalCredits > 0 ? Math.min((credits / totalCredits) * 100, 100) : 0;

  const isLow = totalCredits > 0 && credits / totalCredits <= 0.15;

  /* =========================================================
     PLAN EXPIRY
     ========================================================= */

  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;

  const expiryText =
    expiresAt && !Number.isNaN(expiresAt.getTime())
      ? expiresAt.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  /* =========================================================
     LOCAL STATE
     ========================================================= */

  const [loadingPlan, setLoadingPlan] = useState(null);

  const [message, setMessage] = useState(null);

  /*
    message format:

    {
      type: "success" | "error",
      text: "..."
    }
  */

  /* =========================================================
     LOAD RAZORPAY WHEN DRAWER OPENS
     ========================================================= */

  useEffect(() => {
    if (open) {
      loadRazorpay();
    }
  }, [open]);

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    if (!open) {
      setMessage(null);
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  /* =========================================================
     PAYMENT
     ========================================================= */

  const handlePayment = async (plan) => {
    setMessage(null);
    setLoadingPlan(plan.id);

    try {
      /* -----------------------------------------------------
         1. LOAD RAZORPAY
         ----------------------------------------------------- */

      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Could not load Razorpay. Check your internet connection.",
        );
      }

      /* -----------------------------------------------------
         2. CREATE ORDER
         ----------------------------------------------------- */

      const data = await createOrder({
        plan: plan.id,
      });

      console.log("Create order response:", data);

      if (!data?.success || !data?.order) {
        throw new Error(data?.message || "Failed to create Razorpay order.");
      }

      const order = data.order;

      console.log("Razorpay order:", order);

      /* -----------------------------------------------------
         3. RAZORPAY CHECKOUT
         ----------------------------------------------------- */

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency || "INR",

        name: "CortexAI",

        description: `${plan.name} Plan`,

        order_id: order.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        theme: {
          color: "#6366f1",
        },

        /* ---------------------------------------------------
           4. PAYMENT SUCCESS
           --------------------------------------------------- */

        handler: async (response) => {
          console.log("Razorpay response:", response);

          try {
            /* -----------------------------------------------
               5. VERIFY PAYMENT ON BACKEND
               ----------------------------------------------- */

            const verify = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });

            console.log("Verify response:", verify);

            if (!verify?.success) {
              throw new Error(
                verify?.message || "Payment verification failed.",
              );
            }

            /* -----------------------------------------------
               6. UPDATE REDUX USER
               ----------------------------------------------- */

            if (verify.user) {
              dispatch(
                setUserData({
                  ...userData,

                  user: {
                    ...userData?.user,
                    ...verify.user,
                  },
                }),
              );

              console.log("Updated Redux user:", verify.user);
            }

            /* -----------------------------------------------
               7. SUCCESS MESSAGE
               ----------------------------------------------- */

            setMessage({
              type: "success",
              text: `${plan.name} plan activated successfully.`,
            });
          } catch (error) {
            console.error("Payment verification error:", error);

            setMessage({
              type: "error",
              text:
                error?.response?.data?.message ||
                error?.message ||
                "Payment verification failed.",
            });
          } finally {
            setLoadingPlan(null);
          }
        },

        /* ---------------------------------------------------
           RAZORPAY MODAL CLOSED
           --------------------------------------------------- */

        modal: {
          ondismiss: () => {
            console.log("Razorpay checkout closed");

            setLoadingPlan(null);
          },
        },
      });

      /* -----------------------------------------------------
         PAYMENT FAILED
         ----------------------------------------------------- */

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);

        setMessage({
          type: "error",
          text:
            response.error?.description || "Payment failed. Please try again.",
        });

        setLoadingPlan(null);
      });

      /* -----------------------------------------------------
         OPEN RAZORPAY
         ----------------------------------------------------- */

      razorpay.open();
    } catch (error) {
      console.error("Create payment error:", error);

      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to start payment.",
      });

      setLoadingPlan(null);
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* =================================================
              OVERLAY
              ================================================= */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[55]"
          />

          {/* =================================================
              DRAWER
              ================================================= */}

          <motion.div
            role="dialog"
            aria-label="Billing"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="fixed top-0 right-0 h-[100dvh] w-[400px] max-w-[92vw] bg-[#0f1117] border-l border-white/10 z-[60] shadow-2xl flex flex-col"
          >
            {/* =================================================
                HEADER
                ================================================= */}

            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div>
                <div className="text-white text-lg font-semibold">Billing</div>

                <div className="text-slate-400 text-sm">Plans & Credits</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close billing"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              >
                <X size={18} className="text-slate-300" />
              </button>
            </div>

            {/* =================================================
                SCROLLABLE CONTENT
                ================================================= */}

            <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* =================================================
                  CURRENT PLAN
                  ================================================= */}

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm">Current Plan</p>

                    <h3 className="text-white text-xl font-bold capitalize">
                      {currentPlan}
                    </h3>

                    {expiryText && currentPlan !== "free" && (
                      <p className="text-slate-500 text-xs mt-1">
                        Valid until {expiryText}
                      </p>
                    )}
                  </div>

                  <Crown className="text-yellow-400" />
                </div>

                {/* =================================================
                    CREDITS
                    ================================================= */}

                <div className="mt-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    <span>Credits</span>

                    <span>
                      {credits} / {totalCredits}
                    </span>
                  </div>

                  {/* Progress bar */}

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${creditPercentage}%`,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${
                        isLow ? "bg-red-400" : "bg-yellow-400"
                      }`}
                    />
                  </div>

                  {/* Low credit warning */}

                  {isLow && (
                    <p className="text-red-400/90 text-xs mt-2">
                      You're running low on credits. Upgrade below to keep
                      going.
                    </p>
                  )}
                </div>
              </div>

              {/* =================================================
                  PLANS
                  ================================================= */}

              <div className="mt-6">
                <div className="text-white font-semibold text-sm mb-3">
                  Choose a plan
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id;

                    const isLoading = loadingPlan === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl border p-4 transition-all duration-200 ${
                          isCurrent
                            ? "border-indigo-500/30 bg-indigo-500/[0.06]"
                            : "border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.045]"
                        }`}
                      >
                        {/* =================================================
                            PLAN HEADER
                            ================================================= */}

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold">
                              {plan.name}
                            </h3>

                            <p className="text-slate-500 text-xs mt-1">
                              {plan.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-white font-bold text-lg">
                              ₹{plan.amount}
                            </div>

                            <div className="text-slate-500 text-[10px]">
                              / {plan.validity} days
                            </div>
                          </div>
                        </div>

                        {/* =================================================
                            FEATURES
                            ================================================= */}

                        <div className="mt-4 space-y-2">
                          {plan.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2 text-xs text-slate-400"
                            >
                              <Check
                                size={13}
                                className="text-indigo-400 shrink-0"
                              />

                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* =================================================
                            BUTTON
                            ================================================= */}

                        <button
                          type="button"
                          disabled={isCurrent || loadingPlan !== null}
                          onClick={() => handlePayment(plan)}
                          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                            isCurrent
                              ? "bg-white/[0.05] text-slate-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-700 text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Processing...
                            </>
                          ) : isCurrent ? (
                            "Current Plan"
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* =================================================
                    MESSAGE
                    ================================================= */}

                {message && (
                  <p
                    role="status"
                    className={`mt-4 rounded-xl border px-3 py-2.5 text-xs leading-5 ${
                      message.type === "success"
                        ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400"
                        : "border-red-500/20 bg-red-500/[0.06] text-red-400"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
              </div>

              {/* =================================================
                  TEST MODE
                  ================================================= */}

              <div className="mt-5 rounded-xl border border-yellow-500/10 bg-yellow-500/[0.04] p-3">
                <p className="text-yellow-500/80 text-xs">Razorpay Test Mode</p>

                <p className="text-slate-500 text-[11px] mt-1 leading-5">
                  Payments are simulated while your Razorpay account is in Test
                  Mode. No real money is charged.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
