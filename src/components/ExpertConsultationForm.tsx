
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ExpertConsultationForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('expert_consultations')
        .insert([{
          question: question,
          contact_info: contactInfo,
        }]);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Question submitted successfully",
      });
      setQuestion("");
      setContactInfo("");
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="expert-consultation" className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Expert desk</p>
          <h2 className="text-4xl font-bold text-slate-900">Ask a medical or structural expert</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Send concise questions and how to contact you. We route answers back and keep them searchable for the team.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <Textarea
            placeholder="What do you need help with?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="min-h-[140px]"
          />
          <Input
            placeholder="How should we reach you? (phone, radio call sign, or email)"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
          />
          <Button type="submit" className="w-full rounded-full py-6" disabled={loading}>
            Submit question
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ExpertConsultationForm;
