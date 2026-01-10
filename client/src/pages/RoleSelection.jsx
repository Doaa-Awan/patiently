import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Heart } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function RoleSelection() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    // Navigate to login with role context, or directly to register
    navigate('/login');
  }; 

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">
            Welcome to <span className="text-emerald-600">HealthJournal</span>
          </h1>
          <p className="text-xl text-stone-600">
            A simple way to track symptoms and communicate with your care team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => handleSelect('patient')}
              className="h-full flex flex-col items-center text-center p-8 hover:border-emerald-500 transition-colors cursor-pointer"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                I am a Patient
              </h2>
              <p className="text-stone-500">
                I want to track my own symptoms and health progress day by day.
              </p>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => handleSelect('caregiver')}
              className="h-full flex flex-col items-center text-center p-8 hover:border-emerald-500 transition-colors cursor-pointer"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                I am a Caregiver
              </h2>
              <p className="text-stone-500">
                I am tracking symptoms and health updates for someone else.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
