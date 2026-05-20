'use client';

import { useState } from 'react';

interface Feature {
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
}

interface FeaturesProps {
  features: Feature[];
}

export default function Features({ features }: FeaturesProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider md:tracking-widest mb-3 md:mb-4">核心能力</h2>
        <p className="text-white/50 max-w-xl mx-auto px-4">专业 AI 金融研究，助您洞察市场</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Feature Tabs */}
        <div className="space-y-3 md:space-y-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`w-full p-4 md:p-6 text-left border rounded-lg transition-all ${
                activeFeature === index
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`${activeFeature === index ? 'text-blue-400' : 'text-white/60'}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-white/50">{feature.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <div className="border border-white/10 rounded-lg bg-white/5 p-5 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative z-10">
            <div className="text-blue-400 mb-4 md:mb-6">
              {features[activeFeature].icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{features[activeFeature].title}</h3>
            <p className="text-white/60 mb-6 md:mb-8 text-sm md:text-base">{features[activeFeature].description}</p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {features[activeFeature].details.map((detail, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs md:text-sm">{detail}</span>
                </div>
              ))}
            </div>
            <a
              href={`/ai?prompt=请详细介绍一下${features[activeFeature].title}功能`}
              className="inline-flex items-center gap-1 md:gap-2 mt-6 md:mt-8 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              立即体验
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
