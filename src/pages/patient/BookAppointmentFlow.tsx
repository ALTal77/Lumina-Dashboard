import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Stethoscope,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Wallet,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TimeSlotPicker } from '../../components/shared/TimeSlotPicker';
import { AppImage } from '../../components/shared/AppImage';
import { TimeSlot } from '../../types';

export const BookAppointmentFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { doctors, timeSlots, bookAppointment } = useData();

  const preselectedDocId = searchParams.get('doctor');

  // Step state: 1: Doctor & Slot, 2: Patient Notes & Summary, 3: Mock Payment, 4: Confirmed E-Invoice
  const [step, setStep] = useState<number>(1);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    preselectedDocId || doctors[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Debit Card' | 'Apple Pay' | 'Digital Wallet'>('Credit Card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Result state
  const [bookingResult, setBookingResult] = useState<{ appointmentId: string; paymentId: string } | null>(null);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Filter slots for selected doctor
  const availableSlots = timeSlots.filter((s) => s.doctorId === selectedDoctorId);

  const handleNextToSummary = () => {
    if (!selectedSlot) return;
    setStep(2);
  };

  const handleNextToPayment = () => {
    setStep(3);
  };

  const handleExecuteMockPayment = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setIsProcessing(true);

    // Simulate 1.2s mock payment gateway delay
    setTimeout(async () => {
      const res = await bookAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
        notes,
        consultationFee: selectedDoctor.consultationFee,
        paymentMethod,
      });

      setBookingResult(res);
      setIsProcessing(false);
      setStep(4);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Flow Progress Stepper */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 1 ? 'bg-primary text-white' : 'bg-neutral-bg text-muted'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-bold ${step >= 1 ? 'text-heading' : 'text-muted'}`}>
              {t('bookAppointmentFlow.step1.label')}
            </span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 2 ? 'bg-primary text-white' : 'bg-neutral-bg text-muted'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-bold ${step >= 2 ? 'text-heading' : 'text-muted'}`}>
              {t('bookAppointmentFlow.step2.label')}
            </span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 3 ? 'bg-primary text-white' : 'bg-neutral-bg text-muted'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-bold ${step >= 3 ? 'text-heading' : 'text-muted'}`}>
              {t('bookAppointmentFlow.step3.label')}
            </span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 4 ? 'bg-primary' : 'bg-border'}`} />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step >= 4 ? 'bg-success text-white' : 'bg-neutral-bg text-muted'
              }`}
            >
              4
            </span>
            <span className={`text-xs font-bold ${step >= 4 ? 'text-success' : 'text-muted'}`}>
              {t('bookAppointmentFlow.step4.label')}
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Doctor, Date, and Time Slot */}
      {step === 1 && (
        <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-heading">{t('bookAppointmentFlow.step1.title')}</h2>
            <p className="text-xs text-muted">{t('bookAppointmentFlow.step1.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1.5">
                {t('bookAppointmentFlow.step1.doctorLabel')}
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full px-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading font-medium focus:border-primary"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {t('bookAppointmentFlow.step1.doctorOptionFormat', {
                      name: doc.name,
                      specialty: doc.specialty,
                      fee: doc.consultationFee,
                    })}
                  </option>
                ))}
              </select>

              {selectedDoctor && (
                <div className="mt-4 p-4 bg-primary-tint/50 border border-primary-tint rounded-xl flex items-center gap-3">
                  <AppImage
                    src={selectedDoctor.profilePicture}
                    alt={selectedDoctor.name}
                    className="w-14 h-14 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-heading" dir="auto">{selectedDoctor.name}</h4>
                    <p className="text-[11px] text-primary font-semibold" dir="auto">{selectedDoctor.specialty}</p>
                    <p className="text-[10px] text-muted">{selectedDoctor.departmentName} • {t('bookAppointmentFlow.feeDisplay', { fee: selectedDoctor.consultationFee })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1.5">
                {t('bookAppointmentFlow.step1.dateLabel')}
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading font-medium focus:border-primary"
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-2">
              {t('bookAppointmentFlow.step1.slotsLabel', { date: selectedDate })}
            </label>
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlotId={selectedSlot?.id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-between">
            <button
              onClick={() => navigate('/patient/doctors')}
              className="px-4 py-2 bg-neutral-bg text-heading text-xs font-bold rounded-xl"
            >
              {t('bookAppointmentFlow.step1.cancelButton')}
            </button>
            <button
              disabled={!selectedSlot}
              onClick={handleNextToSummary}
              className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              {t('bookAppointmentFlow.step1.continueButton')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Reason & Summary */}
      {step === 2 && selectedDoctor && selectedSlot && (
        <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-heading">{t('bookAppointmentFlow.step2.title')}</h2>
            <p className="text-xs text-muted">{t('bookAppointmentFlow.step2.subtitle')}</p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 bg-neutral-bg rounded-xl border border-border space-y-3">
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider">{t('bookAppointmentFlow.step2.bookingOverview')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted block uppercase">{t('bookAppointmentFlow.step2.overviewDoctor')}</span>
                <span className="font-bold text-heading" dir="auto">{selectedDoctor.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">{t('bookAppointmentFlow.step2.overviewDate')}</span>
                <span className="font-bold text-heading">{selectedDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">{t('bookAppointmentFlow.step2.overviewTimeSlot')}</span>
                <span className="font-bold text-primary">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">{t('bookAppointmentFlow.step2.overviewFee')}</span>
                <span className="font-bold text-success">{t('bookAppointmentFlow.feeDisplay', { fee: selectedDoctor.consultationFee })}</span>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('bookAppointmentFlow.step2.notesLabel')}
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('bookAppointmentFlow.step2.notesPlaceholder')}
              className="w-full p-3 text-xs bg-neutral-bg border border-border rounded-xl text-heading placeholder-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-neutral-bg text-heading text-xs font-bold rounded-xl"
            >
              {t('bookAppointmentFlow.step2.backButton')}
            </button>
            <button
              onClick={handleNextToPayment}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              {t('bookAppointmentFlow.step2.proceedButton')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Simulated Payment Gateway */}
      {step === 3 && selectedDoctor && (
        <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-heading">{t('bookAppointmentFlow.step3.title')}</h2>
              <p className="text-xs text-muted">{t('bookAppointmentFlow.step3.subtitle')}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-success-bg text-success font-bold text-[10px] flex items-center gap-1 border border-success-bg">
              <Lock className="w-3 h-3" />               {t('bookAppointmentFlow.step3.sslBadge')}
            </span>
          </div>

          {/* Fee Total Banner */}
          <div className="p-4 bg-primary text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-primary-tint font-bold block">{t('bookAppointmentFlow.step3.totalAmount')}</span>
              <span className="text-2xl font-black">{t('bookAppointmentFlow.step3.amountDisplay', { fee: selectedDoctor.consultationFee })}</span>
            </div>
            <div className="text-right rtl:text-left text-xs text-white">
              <p>{t('bookAppointmentFlow.step3.patientLabel', { name: user.name })}</p>
              <p>{t('bookAppointmentFlow.step3.doctorLabel', { name: selectedDoctor.name })}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-2">
              {t('bookAppointmentFlow.step3.paymentMethodLabel')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Credit Card', 'Debit Card', 'Apple Pay', 'Digital Wallet'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === method
                      ? 'bg-primary-tint border-primary text-primary'
                      : 'bg-neutral-bg border-border text-heading'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t(`bookAppointmentFlow.step3.method${method.replace(/\s+/g, '')}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Card Form */}
          <div className="space-y-3 bg-neutral-bg p-4 rounded-xl border border-border">
            <div>
              <label className="block text-[11px] font-semibold text-heading mb-1">
                {t('bookAppointmentFlow.step3.cardNumber')}
              </label>
              <input
                type="text"
                name="mockCardNumber"
                autoComplete="off"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder={t('bookAppointmentFlow.step3.cardNumberPlaceholder')}
                className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-heading placeholder-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-heading mb-1">
                {t('bookAppointmentFlow.step3.expiryDate')}
              </label>
                <input
                  type="text"
                  name="mockCardExpiry"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder={t('bookAppointmentFlow.step3.expiryDatePlaceholder')}
                  className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-heading placeholder-muted"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-heading mb-1">
                  {t('bookAppointmentFlow.step3.cvc')}
                </label>
                <input
                  type="password"
                  name="mockCardCvc"
                  autoComplete="new-password"
                  inputMode="numeric"
                  maxLength={3}
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder={t('bookAppointmentFlow.step3.cvcPlaceholder')}
                  className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-heading placeholder-muted"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-between">
            <button
              onClick={() => setStep(2)}
              disabled={isProcessing}
              className="px-4 py-2 bg-neutral-bg text-heading text-xs font-bold rounded-xl"
            >
              {t('bookAppointmentFlow.step3.backButton')}
            </button>
            <button
              onClick={handleExecuteMockPayment}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-success hover:brightness-90 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('bookAppointmentFlow.step3.processing')}</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{t('bookAppointmentFlow.step3.payButton', { fee: selectedDoctor.consultationFee })}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation & Mock E-Invoice */}
      {step === 4 && selectedDoctor && selectedSlot && bookingResult && (
        <div className="bg-surface rounded-2xl border border-border shadow-xl p-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-success bg-success-bg px-2.5 py-1 rounded-full border border-success-bg">
              {t('bookAppointmentFlow.step4.badge')}
            </span>
            <h2 className="text-2xl font-black text-heading mt-2">{t('bookAppointmentFlow.step4.title')}</h2>
            <p className="text-xs text-muted max-w-md mx-auto mt-1">
              {t('bookAppointmentFlow.step4.message', { doctorName: selectedDoctor.name })}
            </p>
          </div>

          {/* E-Invoice Document */}
          <div className="text-left bg-neutral-bg p-6 rounded-2xl border border-border space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-heading">{t('bookAppointmentFlow.step4.invoiceHospitalName')}</h3>
                <p className="text-[10px] text-muted">{t('bookAppointmentFlow.step4.invoiceSubtitle')}</p>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-xs font-mono font-bold text-heading">
                  {bookingResult.appointmentId}
                </span>
                <p className="text-[10px] text-success font-bold">{t('bookAppointmentFlow.step4.invoiceStatus')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted font-semibold block uppercase">{t('bookAppointmentFlow.step4.invoicePatient')}</span>
                <span className="font-bold text-heading" dir="auto">{user.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted font-semibold block uppercase">{t('bookAppointmentFlow.step4.invoiceDoctor')}</span>
                <span className="font-bold text-heading" dir="auto">{selectedDoctor.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted font-semibold block uppercase">{t('bookAppointmentFlow.step4.invoiceDate')}</span>
                <span className="font-bold text-heading">{selectedDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted font-semibold block uppercase">{t('bookAppointmentFlow.step4.invoiceTimeSlot')}</span>
                <span className="font-bold text-primary">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex items-center justify-between text-xs font-bold">
              <span>{t('bookAppointmentFlow.step4.invoicePaidVia', { method: t(`bookAppointmentFlow.step3.method${paymentMethod.replace(/\s+/g, '')}`) })}</span>
              <span className="text-base text-success">{t('bookAppointmentFlow.step3.amountDisplay', { fee: selectedDoctor.consultationFee })}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-neutral-bg text-heading text-xs font-bold rounded-xl hover:bg-border"
            >
              {t('bookAppointmentFlow.step4.printButton')}
            </button>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-xs"
            >
              {t('bookAppointmentFlow.step4.goToAppointments')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
