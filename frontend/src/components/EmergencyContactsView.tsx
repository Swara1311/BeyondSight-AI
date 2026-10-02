import { useState, useEffect, useCallback } from "react";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import VoiceOrb from "./VoiceOrb";
import {
  listContacts,
  deleteContact,
  createContact,
} from "../services/api";
import type { EmergencyContact } from "../services/api";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useLanguage } from "../context/LanguageContext";

interface EmergencyContactsViewProps {
  token: string;
  onClose: () => void;
}

export default function EmergencyContactsView({ token, onClose }: EmergencyContactsViewProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { speak, stop } = useTextToSpeech();
  const { language, speechLang } = useLanguage();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  async function loadContacts() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listContacts(token);
      setContacts(result.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load contacts");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      setSaveError("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await createContact(name.trim(), phone.trim(), relationship.trim(), token);
      setName("");
      setPhone("");
      setRelationship("");
      setShowAddForm(false);
      speak(`${name} has been added as an emergency contact.`, language);
      await loadContacts();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save this contact");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteContact(id, token);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this contact");
    }
  }

  const handleClose = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  const handleVoiceResult = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase();

      if (
        normalized.includes("close") ||
        normalized.includes("back") ||
        normalized.includes("बंद") ||
        normalized.includes("वापस") ||
        normalized.includes("मागे")
      ) {
        handleClose();
        return;
      }

      if (
        normalized.includes("add contact") ||
        normalized.includes("new contact") ||
        normalized.includes("नया संपर्क") ||
        normalized.includes("नवीन संपर्क")
      ) {
        setShowAddForm(true);
        speak("Please fill in the contact's name, phone number, and relationship.", language);
        return;
      }

      speak("Say 'add contact' to add a new emergency contact, or 'close' to go back.", language);
    },
    [handleClose, speak, language]
  );

  const { isListening, startListening } = useSpeechRecognition(handleVoiceResult);

  function handleVoiceOrbClick() {
    stop();
    startListening(speechLang);
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col"
      role="dialog"
      aria-label="Emergency contacts"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-light)]">
        <span className="text-lg font-bold text-[var(--color-primary-light)]">
          Emergency Contacts
        </span>
        <Button variant="ghost" size="md" onClick={handleClose}>
          Close
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {!showAddForm && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />
            <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
              Say "add contact" to add someone, or "close" to go back
            </p>
          </div>
        )}

        {isLoading && (
          <p className="text-[var(--color-text-secondary)]" role="status">
            Loading contacts...
          </p>
        )}

        {error && (
          <p role="alert" className="text-[var(--color-error)] mb-4">
            {error}
          </p>
        )}

        {!isLoading && contacts.length === 0 && !showAddForm && (
          <p className="text-[var(--color-text-secondary)] text-center mt-8">
            No emergency contacts yet. Add someone who should be contacted in an emergency.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{contact.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {contact.relationship} · {contact.phone}
                </p>
              </div>
              <Button variant="ghost" size="md" onClick={() => handleDelete(contact.id)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>

        {showAddForm && (
          <div className="mt-6 flex flex-col gap-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Mother, Friend, Neighbor"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />

            {saveError && (
              <p role="alert" className="text-sm text-[var(--color-error)]">
                {saveError}
              </p>
            )}

            <Button variant="primary" size="lg" onClick={handleSave} isLoading={isSaving}>
              Save Contact
            </Button>
          </div>
        )}
      </div>

      {!showAddForm && (
        <div className="flex-shrink-0 p-5 border-t border-[var(--color-surface-light)]">
          <Button variant="primary" size="lg" onClick={() => setShowAddForm(true)}>
            + Add Emergency Contact
          </Button>
        </div>
      )}
    </div>
  );
}