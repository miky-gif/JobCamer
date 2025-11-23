import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { PAYMENT_METHODS, COMMISSION_RATE } from '../utils/constants';
import { formatCurrency, calculateCommission } from '../utils/helpers';
import { CreditCard, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import { PaymentMethod } from '../types';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Exemple de montant (devrait venir des props ou du contexte)
  const amount = 50000;
  const commission = calculateCommission(amount, COMMISSION_RATE);
  const total = amount + commission;

  const handlePayment = async () => {
    setLoading(true);
    
    // Simulation de paiement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setPaymentSuccess(true);
    
    // Redirection après succès
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-l-4 border-green-500 shadow-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement réussi !
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre paiement de {formatCurrency(total)} a été effectué avec succès.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirection en cours...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 via-red-50 to-yellow-50 dark:from-green-900/20 dark:via-red-900/20 dark:to-yellow-900/20 rounded-2xl border-l-4 border-green-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paiement sécurisé
          </h1>
        </div>

        {/* Amount summary */}
        <Card className="mb-6 border-l-4 border-green-500 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Récapitulatif
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Montant de la mission</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Commission JobCamer ({(COMMISSION_RATE * 100).toFixed(0)}%)</span>
              <span>{formatCurrency(commission)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total à payer</span>
              <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </Card>

        {/* Payment method selection */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Méthode de paiement
          </h2>
          
          <div className="space-y-3">
            {/* Orange Money */}
            <button
              onClick={() => setSelectedMethod('orange_money')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'orange_money'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Smartphone className="text-white" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Orange Money
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Paiement mobile sécurisé
                </div>
              </div>
              {selectedMethod === 'orange_money' && (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>

            {/* MTN Mobile Money */}
            <button
              onClick={() => setSelectedMethod('mtn_momo')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'mtn_momo'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Smartphone className="text-white" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 dark:text-white">
                  MTN Mobile Money
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Paiement mobile sécurisé
                </div>
              </div>
              {selectedMethod === 'mtn_momo' && (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>

            {/* Cash */}
            <button
              onClick={() => setSelectedMethod('cash')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'cash'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Banknote className="text-white" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Espèces
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Paiement en main propre
                </div>
              </div>
              {selectedMethod === 'cash' && (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          </div>
        </Card>

        {/* Payment details */}
        {(selectedMethod === 'orange_money' || selectedMethod === 'mtn_momo') && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations de paiement
            </h2>
            <Input
              label="Numéro de téléphone"
              type="tel"
              placeholder="6XX XX XX XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              helperText={`Entrez le numéro ${selectedMethod === 'orange_money' ? 'Orange Money' : 'MTN MoMo'} à débiter`}
              icon={<Smartphone size={20} />}
            />
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>💡 Comment ça marche :</strong>
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-400 mt-2 space-y-1 list-decimal list-inside">
                <li>Entrez votre numéro de téléphone</li>
                <li>Vous recevrez une notification sur votre téléphone</li>
                <li>Composez votre code PIN pour valider</li>
                <li>Le paiement sera confirmé instantanément</li>
              </ol>
            </div>
          </Card>
        )}

        {selectedMethod === 'cash' && (
          <Card className="mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-300">
                <strong>⚠️ Paiement en espèces :</strong>
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-2">
                Le paiement en espèces sera effectué directement entre vous et le travailleur/employeur.
                JobCamer recommande de toujours demander un reçu pour toute transaction.
              </p>
            </div>
          </Card>
        )}

        {/* Security info */}
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Paiement sécurisé
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vos informations de paiement sont cryptées et sécurisées. JobCamer ne stocke jamais vos données bancaires.
              </p>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button
            fullWidth
            loading={loading}
            onClick={handlePayment}
            disabled={
              (selectedMethod !== 'cash' && !phoneNumber.trim()) ||
              loading
            }
          >
            Payer {formatCurrency(total)}
          </Button>
        </div>
      </div>
    </div>
  );
};
