import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';

const contracts = [
  {
    athlete: 'Alice Jane',
    campaign: 'Spring Promo',
    dateCreated: '2024-05-01',
    dateSigned: '2024-05-03',
    payout: '$2,000',
    status: 'Signed',
    pdf: '/dummy-contract.pdf',
  },
  {
    athlete: 'Bob Smith',
    campaign: 'Summer Launch',
    dateCreated: '2024-04-15',
    dateSigned: '2024-04-18',
    payout: '$1,500',
    status: 'Pending',
    pdf: '/dummy-contract.pdf',
  },
  {
    athlete: 'Jane Doe',
    campaign: 'Winter Games',
    dateCreated: '2024-03-10',
    dateSigned: '2024-03-12',
    payout: '$3,000',
    status: 'Signed',
    pdf: '/dummy-contract.pdf',
  },
  {
    athlete: 'Mike Lee',
    campaign: 'Autumn Fest',
    dateCreated: '2024-02-20',
    dateSigned: '2024-02-22',
    payout: '$2,500',
    status: 'Signed',
    pdf: '/dummy-contract.pdf',
  },
  {
    athlete: 'Sara Kim',
    campaign: 'New Year Bash',
    dateCreated: '2024-01-05',
    dateSigned: '2024-01-07',
    payout: '$1,800',
    status: 'Pending',
    pdf: '/dummy-contract.pdf',
  },
];

const BrandContracts = () => {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="w-full max-w-full px-0 md:px-4 py-6 overflow-x-hidden">
      <h2 className="text-[#9afa00] text-2xl font-bold mb-6 uppercase tracking-wide text-center md:text-left">Contracts</h2>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-white text-sm md:text-base">
          <thead>
            <tr className="border-b border-gray-600 text-left">
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Athlete</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Campaigns</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Date Created</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Date Talent Signed</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Payout</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Status</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">PDF</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-lg">No results</td>
              </tr>
            ) : (
              contracts.map((c, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-[#232626] transition">
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{c.athlete}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{c.campaign}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{c.dateCreated}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{c.dateSigned}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{c.payout}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">
                    <span className={`font-bold ${c.status === 'Signed' ? 'text-[#9afa00]' : 'text-yellow-400'}`}>{c.status}</span>
                  </td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">
                    <a
                      href={c.pdf}
                      download
                      className="inline-flex items-center gap-2 bg-[#232626] border border-[#9afa00] text-[#9afa00] px-3 py-2 rounded-md font-bold hover:bg-[#9afa00] hover:text-black transition"
                    >
                      <FaDownload /> PDF
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8 w-full">
        <button
          className="bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          {'<'}
        </button>
        {[1, 2, 3, '...', 10].map((num, idx) => (
          typeof num === 'number' ? (
            <button
              key={num}
              className={`px-3 py-2 rounded-md font-bold ${page === num ? 'bg-[#9afa00] text-black' : 'bg-black text-white'}`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ) : (
            <span key={idx} className="px-2 text-white">{num}</span>
          )
        ))}
        <button
          className="bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default BrandContracts;