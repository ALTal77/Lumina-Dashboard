import React from 'react';
import { useTranslation } from 'react-i18next';
import fullLogo from '../../assets/images/full.png';

export interface InvoiceReceiptProps {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  paymentMethodLabel: string;
  amountLabel: string;
}

export const InvoiceReceipt = React.forwardRef<HTMLDivElement, InvoiceReceiptProps>(
  function InvoiceReceipt(
    { appointmentId, patientName, doctorName, date, timeSlot, paymentMethodLabel, amountLabel },
    ref,
  ) {
    const { t, i18n } = useTranslation();
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

    const issuedAt = new Date().toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        ref={ref}
        dir={dir}
        className="printable-only text-left rtl:text-right bg-neutral-bg p-6 rounded-2xl border border-border space-y-4 max-w-xl mx-auto"
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <div className="flex justify-between items-start gap-4 border-b border-border pb-3">
          <div className="flex-1 min-w-0">
            <img
              src={fullLogo}
              alt={t('bookAppointmentFlow.step4.invoiceHospitalName')}
              className="h-8 w-auto object-contain mb-2"
            />
            <h3 className="text-sm font-bold text-heading">
              {t('bookAppointmentFlow.step4.invoiceHospitalName')}
            </h3>
            <p className="text-[10px] text-muted">
              {t('bookAppointmentFlow.step4.invoiceSubtitle')}
            </p>
          </div>
          <div className="text-right rtl:text-left flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-xs font-mono font-bold text-heading">
              {appointmentId}
            </span>
            <span className="text-[10px] text-success font-bold bg-success-bg px-2 py-0.5 rounded-full border border-success-bg">
              {t('bookAppointmentFlow.step4.invoiceStatus')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-muted font-semibold block uppercase">
              {t('bookAppointmentFlow.step4.invoicePatient')}
            </span>
            <span className="font-bold text-heading" dir="auto">
              {patientName}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted font-semibold block uppercase">
              {t('bookAppointmentFlow.step4.invoiceDoctor')}
            </span>
            <span className="font-bold text-heading" dir="auto">
              {doctorName}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted font-semibold block uppercase">
              {t('bookAppointmentFlow.step4.invoiceDate')}
            </span>
            <span className="font-bold text-heading">{date}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted font-semibold block uppercase">
              {t('bookAppointmentFlow.step4.invoiceTimeSlot')}
            </span>
            <span className="font-bold text-primary">{timeSlot}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3 flex items-center justify-between text-xs font-bold">
          <span>
            {t('bookAppointmentFlow.step4.invoicePaidVia', {
              method: paymentMethodLabel,
            })}
          </span>
          <span className="text-base text-success">{amountLabel}</span>
        </div>

        <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-[10px] text-muted">
          <span>{t('bookAppointmentFlow.step4.issuedAt', { date: issuedAt })}</span>
          <span className="font-mono font-semibold">{appointmentId}</span>
        </div>
      </div>
    );
  },
);
