'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { number: 1, label: 'Recompensa', icon: '🎁' },
  { number: 2, label: 'Diseño', icon: '🎨' },
  { number: 3, label: 'QR', icon: '📱' },
  { number: 4, label: 'Listo', icon: '✨' },
];

export function ProgressIndicator({ currentStep, completedSteps, onStepClick }: ProgressIndicatorProps) {
  const isStepClickable = (stepNumber: number) => {
    return stepNumber < currentStep || completedSteps.includes(stepNumber);
  };

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'clickable';
    return 'upcoming';
  };

  return (
    <div className="w-full py-8">
      {/* Progress Bar Background */}
      <div className="relative">
        {/* Line connecting steps */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const status = getStepStatus(step.number);
            const isClickable = isStepClickable(step.number);

            return (
              <button
                key={step.number}
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                className="flex flex-col items-center group"
              >
                {/* Circle indicator */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    transition-all duration-300 border-2
                    ${
                      status === 'completed'
                        ? 'bg-gradient-to-br from-purple-500 to-orange-500 border-transparent text-white'
                        : status === 'current'
                        ? 'bg-white border-purple-500 text-purple-500 shadow-lg scale-110'
                        : status === 'clickable'
                        ? 'bg-purple-50 border-purple-300 text-purple-400 hover:border-purple-500 cursor-pointer'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }
                  `}
                >
                  {status === 'completed' ? '✓' : step.icon}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-2 text-sm font-medium transition-colors
                    ${
                      status === 'current'
                        ? 'text-purple-600'
                        : status === 'completed'
                        ? 'text-gray-700'
                        : status === 'clickable'
                        ? 'text-gray-500 group-hover:text-purple-500'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
