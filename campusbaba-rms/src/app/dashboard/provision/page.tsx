"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProvisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    adminEmail: "",
    adminPassword: "",
    maxStudents: 100,
    maxTeachers: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api/v1";
      await axios.post(`${apiUrl}/superadmin/tenants`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`
        }
      });
      setSuccess("Organization provisioned successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to provision tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Provision New Organization</h2>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
            <input 
              required type="text" className="w-full border p-2 rounded-lg" placeholder="e.g. Dhaka Public School"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomain</label>
            <div className="flex">
              <input 
                required type="text" className="w-full border p-2 rounded-l-lg" placeholder="dhakapublic"
                value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                .campusbaba.com
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Initial Administrator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input 
                required type="email" className="w-full border p-2 rounded-lg" 
                value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
              <input 
                required type="password" minLength={6} className="w-full border p-2 rounded-lg"
                value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Initial Quotas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students</label>
              <input 
                required type="number" min={1} className="w-full border p-2 rounded-lg" 
                value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: +e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Teachers</label>
              <input 
                required type="number" min={1} className="w-full border p-2 rounded-lg" 
                value={formData.maxTeachers} onChange={e => setFormData({...formData, maxTeachers: +e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Provisioning Database..." : "Provision Organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
