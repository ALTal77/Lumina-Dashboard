import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Department } from '../../types';
import { Modal } from '../../components/shared/Modal';
import { StatusPill } from '../../components/shared/StatusPill';

export const ManageDepartments: React.FC = () => {
  const { t } = useTranslation();
  const { departments, doctors, addDepartment, updateDepartment, deleteDepartment } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'closed'>('active');

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setIcon('Building2');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description);
    setIcon(dept.icon);
    setStatus(dept.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      updateDepartment(editingDept.id, { name, description, icon, status });
    } else {
      addDepartment({ name, description, icon, status });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('manageDepartments.title')}</h1>
          <p className="text-xs text-muted mt-0.5">
            {t('manageDepartments.subtitle')}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('manageDepartments.button.add')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptDocs = doctors.filter((d) => d.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-surface rounded-2xl border border-border p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-primary-tint text-primary rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <StatusPill status={dept.status} />
                </div>
                <h3 className="text-base font-bold text-heading mb-1">{dept.name}</h3>
                <p className="text-xs text-muted mb-4 leading-relaxed">{dept.description}</p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  {t('manageDepartments.assignedDoctors', { count: deptDocs.length })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 text-muted hover:text-primary hover:bg-primary-tint rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-1.5 text-muted hover:text-danger hover:bg-danger-bg rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDept ? t('manageDepartments.modal.editTitle', { name: editingDept.name }) : t('manageDepartments.modal.addTitle')}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-heading mb-1">{t('manageDepartments.form.name')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-page border border-border rounded-lg text-heading"
              />
            </div>

            <div>
              <label className="block font-semibold text-heading mb-1">{t('manageDepartments.form.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-page border border-border rounded-lg text-heading"
              >
                <option value="active">{t('manageDepartments.statusOption.active')}</option>
                <option value="maintenance">{t('manageDepartments.statusOption.maintenance')}</option>
                <option value="closed">{t('manageDepartments.statusOption.closed')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-heading mb-1">{t('manageDepartments.form.description')}</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-page border border-border rounded-lg text-heading"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-neutral-bg text-heading text-xs font-bold rounded-lg"
              >
                {t('manageDepartments.button.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
              >
                {t('manageDepartments.button.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
