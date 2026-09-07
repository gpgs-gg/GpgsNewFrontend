import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Pricing = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, // global animation duration
            once: false, // whether animation should happen only once - default true
        });
        AOS.refresh(); // refresh AOS when component mounts or updates
    }, []);



  return (
<>
 <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the perfect accommodation that fits your budget</p>
          </div>

          <div  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
       
            <div className="card-hover bg-white rounded-xl shadow-lg overflow-hidden border">
              <div className="price-card p-6 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Double Sharing</h3>
                <p className="opacity-90">AC Facility</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₹9,500</span>
                  <span className="text-lg opacity-90"> - ₹14,000</span>
                </div>
                <p className="text-sm opacity-80 mt-2">per person per month</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-600">
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Air-conditioned room</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Enhanced comfort</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>All premium amenities</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>24/7 support</li>
                </ul>
              </div>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-200">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
                <div className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-sm font-semibold mb-2 inline-block">POPULAR</div>
                <h3 className="text-2xl font-bold mb-2">Private Room</h3>
                <p className="opacity-90">AC/Non-AC Options</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₹8,500</span>
                  <span className="text-lg opacity-90"> - ₹28,000</span>
                </div>
                <p className="text-sm opacity-80 mt-2">per person per month</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-600">
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Complete privacy</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Personal space</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Premium furnishing</li>
                  <li><i className="fas fa-check text-green-500 mr-3"></i>Priority support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-[#F8F9FB] rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-[#407105] mb-6 text-center">Additional Information</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Monthly Expenses</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><i className="fas fa-rupee-sign text-red-500 mr-2"></i>Rent + Electricity Bill (Your responsibility)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Deposit</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><i className="fas fa-shield-alt text-blue-500 mr-2"></i>1-2 months rent (varies by property)</li>
                  <li><i className="fas fa-clock text-green-500 mr-2"></i>Fully refundable with 1 month notice</li>
                  <li><i className="fas fa-file-contract text-purple-500 mr-2"></i>Documentation charges: ₹500 (one-time)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
</>
)
}

export default Pricing