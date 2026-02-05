import React from 'react';

export default function ReferralInfoCard({ user }) {
    const referralPeople = user.referralPeople || [];
    const referralCode = user.referralCode || user.referalCode || user.referealCode || 'N/A';

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Referral Network
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">Referral Code</div>
                    <div className="text-xl font-bold text-purple-900 flex items-center gap-2">
                        {referralCode}
                        <button
                            className="text-purple-400 hover:text-purple-600 transition-colors"
                            onClick={() => navigator.clipboard.writeText(referralCode)}
                            title="Copy Code"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Total Referred</div>
                    <div className="text-xl font-bold text-blue-900">{referralPeople.length} Users</div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Referred Users</h4>
                {referralPeople.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {referralPeople.map((person, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <img
                                    src={person.profileAvatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(person.userName) + "&background=random"}
                                    alt={person.userName}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{person.userName}</p>
                                    <p className="text-xs text-gray-500">
                                        Joined {new Date(person.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No referrals yet
                    </div>
                )}
            </div>
        </div>
    );
}
