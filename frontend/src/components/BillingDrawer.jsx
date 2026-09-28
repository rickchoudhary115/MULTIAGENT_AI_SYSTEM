import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, X } from "lucide-react";
import { useSelector } from "react-redux";

function BillingDrawer({ open, onClose }) {
  const { userData } = useSelector((state) => state.user);

  // IMPORTANT: your actual user is nested inside userData.user
  const user = userData?.user;

  const credits = Number(user?.credits ?? 0);
  const totalCredits = Number(user?.totalCredits ?? 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 right-0 h-screen w-[400px] bg-[#0f1117] border-l border-white/10 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <div className="text-white text-lg font-semibold">Billing</div>

                <div className="text-slate-400 text-sm">Plans & Credits</div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm">Current Plan</p>

                    <h3 className="text-white text-xl font-bold capitalize">
                      {user?.plan ?? "free"}
                    </h3>
                  </div>

                  <Crown className="text-yellow-400" />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    <span>Credits</span>

                    <span>
                      {credits} / {totalCredits}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{
                        width: `${
                          totalCredits > 0
                            ? Math.min((credits / totalCredits) * 100, 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
