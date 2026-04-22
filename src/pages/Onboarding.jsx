import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Onboarding() {
  const { user } = useAuth();
  const [sinceDate, setSinceDate] = useState("");
  const [untilDate, setUntilDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [step, setStep] = useState("create");
  const navigate = useNavigate();

  async function createCouple(e) {
    e.preventDefault();
    if (!sinceDate || !untilDate) {
      toast.error("Please fill both dates");
      return;
    }
    const { data, error } = await supabase
      .from("couples")
      .insert([
        { creator1_id: user.id, since_date: sinceDate, until_date: untilDate },
      ])
      .select()
      .single();
    // Inside createCouple function after successful insert:
    if (data) {
      toast.success(
        "Couple created! Share this invite code with your partner: " + data.id,
      );
      navigate("/"); // <-- This must be present
    }
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Couple created! Share this invite code with your partner: " + data.id,
    );
    navigate("/");
  }

  async function joinCouple(e) {
    e.preventDefault();
    if (!inviteCode) {
      toast.error("Enter invite code");
      return;
    }
    const { data: couple, error: findError } = await supabase
      .from("couples")
      .select("*")
      .eq("id", inviteCode)
      .single();
    if (findError || !couple) {
      toast.error("Invalid invite code");
      return;
    }
    if (couple.creator2_id) {
      toast.error("Couple already has two members");
      return;
    }
    const { error: updateError } = await supabase
      .from("couples")
      .update({ creator2_id: user.id })
      .eq("id", couple.id);
    if (updateError) {
      toast.error(updateError.message);
      return;
    }
    toast.success("Joined couple!");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 p-6 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
          Welcome to CoupleVault
        </h2>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setStep("create")}
            className={`flex-1 py-2 rounded-lg ${step === "create" ? "bg-pink-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
          >
            Create a couple
          </button>
          <button
            onClick={() => setStep("join")}
            className={`flex-1 py-2 rounded-lg ${step === "join" ? "bg-pink-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
          >
            Join existing
          </button>
        </div>
        {step === "create" && (
          <form onSubmit={createCouple} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Since date (first dated day)
              </label>
              <input
                type="date"
                value={sinceDate}
                onChange={(e) => setSinceDate(e.target.value)}
                className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Until date (anniversary)
              </label>
              <input
                type="date"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg"
            >
              Create
            </button>
          </form>
        )}
        {step === "join" && (
          <form onSubmit={joinCouple} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Invite code (from your partner)
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg"
            >
              Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
