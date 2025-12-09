
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import LocationPicker from "./LocationPicker";
import { useAuth } from "./AuthProvider";
import ImageUploadSection from "./missing-person/ImageUploadSection";
import PersonalDetailsForm from "./missing-person/PersonalDetailsForm";

const MissingPersonForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [missingPerson, setMissingPerson] = useState({
    name: "",
    lastSeen: "",
    age: "",
    gender: "",
    features: "",
    contact: "",
    image: null as File | null,
    latitude: 28.3949,
    longitude: 84.1240,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto rounded-2xl bg-white shadow-sm p-10 border border-slate-100">
          <h2 className="text-3xl font-bold mb-3 text-slate-900">Sign in to continue</h2>
          <p className="mb-6 text-slate-600">Log in to submit and track missing person reports. This keeps reports verified and actionable for responders.</p>
          <Button onClick={() => navigate('/auth')} className="rounded-full px-6 py-6">
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `missing-persons/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('disaster-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('disaster-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleLocationSelected = (lat: number, lng: number) => {
    setMissingPerson(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMissingPerson({ ...missingPerson, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setMissingPerson(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;
      if (missingPerson.image) {
        imageUrl = await handleImageUpload(missingPerson.image);
      }

      const { error } = await supabase
        .from('missing_persons')
        .insert([{
          name: missingPerson.name,
          last_seen_location: missingPerson.lastSeen,
          age: parseInt(missingPerson.age),
          gender: missingPerson.gender,
          identifying_features: missingPerson.features,
          reporter_contact: missingPerson.contact,
          image_url: imageUrl,
          latitude: missingPerson.latitude,
          longitude: missingPerson.longitude,
          reporter_id: session.user.id,
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Missing person report submitted successfully",
      });
      
      navigate('/previous-detail-report');
    } catch (error) {
      console.error('Error submitting missing person report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="report-missing" className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">People first</p>
          <h2 className="text-4xl font-bold text-slate-900">Report a missing person</h2>
          <p className="text-slate-600 max-w-3xl">
            Capture the essentials: who is missing, where they were last seen, and how to reach you. We’ll keep the details organized for operators and responders.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-[320px,1fr] gap-6">
            <ImageUploadSection
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={() => {
                setImagePreview(null);
                setMissingPerson({ ...missingPerson, image: null });
              }}
            />
            <PersonalDetailsForm
              name={missingPerson.name}
              lastSeen={missingPerson.lastSeen}
              age={missingPerson.age}
              gender={missingPerson.gender}
              features={missingPerson.features}
              contact={missingPerson.contact}
              onChange={handleFormChange}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <LocationPicker
              onLocationSelected={handleLocationSelected}
              initialLat={missingPerson.latitude}
              initialLng={missingPerson.longitude}
            />
          </div>

          <div className="flex justify-between items-center">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full"
              disabled={loading}
            >
              Submit Report
            </Button>
            <Button 
              type="button"
              onClick={() => navigate('/previous-detail-report')}
              className="bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full"
            >
              View All Reports
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default MissingPersonForm;

