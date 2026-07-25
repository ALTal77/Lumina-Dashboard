import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Stethoscope, Heart, Brain, Baby, Bone, Sparkles, Eye, Smile, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusPill } from '../../components/shared/StatusPill';

export const BrowseDepartments: React.FC = () => {
  const { departments, doctors } = useData();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'heart': return Heart;
      case 'brain': return Brain;
      case 'baby': return Baby;
      case 'bone': return Bone;
      case 'sparkles': return Sparkles;
      case 'eye': return Eye;
      case 'smile': return Smile;
      default: return Building2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('browseDepartments.title')}</h1>
          <p className="text-xs text-muted mt-1">
            {t('browseDepartments.subtitle')}
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-neutral-bg text-heading rounded-lg self-start sm:self-auto">
          {t('browseDepartments.totalCount', { count: departments.length })}
        </div>
      </div>

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const IconComponent = getDepartmentIcon(dept.icon);
          const deptDoctors = doctors.filter((d) => d.departmentId === dept.id);
          const isBookable = dept.status === 'active' && deptDoctors.length > 0;

          return (
            <div
              key={dept.id}
              className={`bg-surface rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                dept.status === 'active'
                  ? 'border-border hover:border-primary hover:shadow-md'
                  : 'border-border bg-page/50 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-primary-tint text-primary rounded-xl border border-primary-tint">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <StatusPill status={dept.status} />
                </div>

                <h3 className="text-base font-bold text-heading mb-1" dir="auto">{dept.name}</h3>
                <p className="text-xs text-muted leading-relaxed mb-4" dir="auto">
                  {dept.description}
                </p>
              </div>

              <div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs mb-3">
                  <span className="text-muted">{t('browseDepartments.card.availableDoctors')}</span>
                  <span className="font-bold text-heading">{t('browseDepartments.card.specialistCount', { count: deptDoctors.length })}</span>
                </div>

                {isBookable ? (
                  <button
                    onClick={() => navigate(`/patient/doctors?dept=${dept.id}`)}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{t('browseDepartments.button.viewDoctors', { name: dept.name })}</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 bg-neutral-bg text-muted text-xs font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{dept.status === 'maintenance' ? t('browseDepartments.button.inMaintenance') : t('browseDepartments.button.departmentClosed')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
