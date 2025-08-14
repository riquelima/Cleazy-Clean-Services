import React, { useState } from 'react';
import { ChevronDownIcon, LightbulbIcon } from './icons';

export const PinnedMessage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const examples = [
    "Gostaria de um orçamento para limpeza básica da minha cozinha e banheiro.",
    "Quanto custaria uma limpeza profunda para minha casa com 3 quartos, 2 banheiros e sala de estar?",
    "Quais são os preços para limpeza total da minha lavanderia e escritório?",
    "Gostaria de saber o preço para limpeza de janelas (internas e externas) e limpeza da geladeira.",
    "Tenho uma casa nova e preciso de uma limpeza pós-obra. Pode me informar o custo?",
    "Quais são os descontos disponíveis para serviços recorrentes?",
    "Gostaria de um orçamento para o pacote de limpeza que inclui 2 quartos, sala de TV, sala de jantar, 2 banheiros, lavanderia e cozinha.",
    "Quanto custa para trocar a roupa de cama?",
    "Gostaria de saber o preço para limpeza básica e profunda de todos os cômodos da minha casa.",
    "Pode me fornecer a tabela de preços para cada tipo de limpeza?",
  ];

  return (
    <div className="bg-cyan-50 border border-cyan-200/80 rounded-lg text-sm text-cyan-900 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold p-4"
        aria-expanded={isOpen}
        aria-controls="pinned-message-content"
      >
        <div className="flex items-center gap-3">
           <LightbulbIcon className="w-5 h-5 text-cyan-600 flex-shrink-0" />
           <span>Como posso te ajudar?</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-cyan-600 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        id="pinned-message-content"
        className={`overflow-hidden transition-[max-height] duration-700 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-cyan-200/80">
          <p className="mb-4 text-cyan-800">
            Olá, sou o assistente virtual da Cleazy Cleaning Services e estou aqui para te ajudar. Diga em poucas palavras o que deseja. Veja os exemplos abaixo:
          </p>
          <ul className="list-disc list-inside space-y-2.5 text-cyan-700/90">
            {examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};