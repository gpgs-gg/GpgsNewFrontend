import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';

const AgreementPopup = () => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    // Check if user is client and has not accepted agreement
    if (user?.role?.trim().toLowerCase() === 'client') {
      const hasAccepted = localStorage.getItem(`agreement_accepted_${user._id}`);
      if (!hasAccepted) {
        setShowPopup(true);
      }
    }
  }, [user]);

  const handleAccept = () => {
    if (isAgreed) {
      localStorage.setItem(`agreement_accepted_${user._id}`, 'true');
      setShowPopup(false);
    }
  };

  const handleClose = () => {
    // Optional: Logout or redirect if they don't accept
    // For now, just close
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Terms & Conditions Agreement
            </h2>
            <p className="text-sm text-gray-500 text-center mt-1">
              Please read and accept the agreement to continue
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white shadow-lg rounded-lg p-6">
              {/* Agreement Content */}
              <div className="space-y-4 text-gray-700 text-sm">
                <h3 className="text-xl font-bold text-center mb-4">AGREEMENT (Terms & Conditions)</h3>
                
                {/* Rules */}
                <p><span className="font-semibold">1.</span> Smoking and Hard drinks (Alcohol) are not allowed inside the Paying Guest Facility, also keeping such things / packets in open will not be tolerated.</p>
                <p><span className="font-semibold">2.</span> Friends are not allowed inside the Paying Guest Facility for any reason, Relatives are allowed to stay overnight in the Paying Guest Facility depending upon the availability and management's approval and the stay is chargeable.</p>
                <p><span className="font-semibold">3.</span> In your absence or presence you do not have rights to allow anyone else to stay on your bed or someone else's bed in the pg facility.</p>
                <p><span className="font-semibold">4.</span> <strong>Notice Period</strong> : It should be communicated on whatsapp or text message to our <strong>customer care number ( 8928 191 814 )</strong>, verbal communication and communication to our staff members will not be considered / entertained. If you wish to vacate the Paying Guest Facility <strong>one month's notice period</strong> is mandatory, so the rent is applicable / chargeable for next one month from the date you give the notice whether you stay or not. Please Note the deposit amount will not be adjusted as rent during the notice period.</p>
                <p><span className="font-semibold">5.</span> <strong>Full & Final Settlement Amount</strong> : After the LICENSEE vacates the said premises in a peaceful state and with complete handover, the LICENSOR will try to refund the full and final settlement amount the same day, but at times may get delayed due to some or the other reason, so we request LICENSEE to grant us a three days time to refund the full and final settlement amount.</p>
                <p><span className="font-semibold">6.</span> <strong>Rent</strong> is to be paid by 1st of every month or max by 3rd of every month, else a 50 INR fine will be charged per day from 4th of every month.</p>
                <p><span className="font-semibold">7.</span> In case of serious illness or infectious disease, the LICENSEE is requested to shift from the Paying Guest Facility to stay with the Local Guardians / Parents.</p>
                <p><span className="font-semibold">8.</span> None of our paying guest facilities have any security person available, you're an adult person so please take responsibility for your own security during arguments or fights with your roommates / flatmates, we as management will try our best to sort out such arguments / fights but we do not take any responsibility for anyone's loss in any sense.</p>
                <p><span className="font-semibold">9.</span> LICENSEE should keep all the valuables locked inside the wardrobe, management will not be responsible for any loss / theft. Paying Guest Management is not responsible for your vehicle damage or theft, so park your vehicle at your own risk.</p>
                <p><span className="font-semibold">10.</span> Parking of any vehicle space is allotted depending upon the space availability and it may be chargeable as per Society rules.</p>
                <p><span className="font-semibold">11.</span> Paying Guest Facility management is not responsible for the LICENSEE in person nor for the LICENSEE belongings kept inside or outside the property in any sense.</p>
                <p><span className="font-semibold">12.</span> The LICENSEE will be held responsible for not following the rules, any breakage / damage to the Paying Guest Facility. In all such cases, LICENSEE will have to pay the cost of such breakage / damage, LICENSEE will be asked to vacate the Paying Guest Facility immediately and if required POLICE will be involved.</p>
                <p><span className="font-semibold">13.</span> The LICENSEE is not allowed to go out or come inside of the Paying Guest Facility after 11 PM except for those working in the 2nd or 3rd shift.</p>
                <p><span className="font-semibold">14.</span> <strong>Electricity Bill</strong> : Paying Guest Facility management gives free electricity up to 150 INR per person for Non AC Paying Guest Facility and 250 INR per person for AC Paying Guest Facility, total free electricity is calculated based on the number of people staying in the Paying Guest Facility for that particular month of electricity bill cycle as per the power provider company, excess amount will be equally divided among the number of people staying in the Paying Guest Facility and this amount needs to be paid along with the monthly rent. Also note if you happen to be not in a paying facility for a complete 15 days without any break then please inform Paying Guest Management, we will exempt you for the electricity bill for those 15 days.</p>
                <p><span className="font-semibold">15.</span> <strong>Booking Cancellation Penalty Amount</strong> : <br /><strong>CASE I</strong> : If the booking is canceled before the date of joining, in this case the penalty amount is 1 Month rent. <br /><strong>CASE II</strong> : If the booking is canceled after the date of joining, in this case the Rule <strong>No. 4</strong> mentioned above is applicable.</p>
                <p><span className="font-semibold">16.</span> <strong>Booking Auto Cancellation</strong> : If you have reserved the bed by paying the minimum booking amount as per our deal, we will hold your reservation for maximum 10 days from the scheduled date of joining, after this it gets auto canceled.</p>
                <p><span className="font-semibold">17.</span> <strong>Increase in the monthly rent</strong> : It is Gopal's Paying Guest Services management decision. We try to inform everyone a minimum 45 days in advance before we increase the monthly rent. In this paying guest business it is practically not possible to wait for every individual to complete an 11 months stay from the date of joining.</p>
                <p><span className="font-semibold">18.</span> Gopal's Paying Guest Services not being the sole owner of this said premises, so we will not be able to support you with any supporting documents in regards to Passport / Vehicle Registration / Bank Loan Process / Etc.</p>
                <p><span className="font-semibold">19.</span> Gopal's Paying Guest Services has complete rights to make changes in the ongoing services and these decisions are taken based on time, place and circumstances.</p>
                <p><span className="font-semibold">20.</span> The rent increment decision is completely based on the management's decision and not dependent upon the tenure the pg client has completed in our pg facility.</p>

                <hr className="my-4 border-gray-300" />

                {/* Self Declaration */}
                <h4 className="font-bold text-lg">Self Declaration Form</h4>
                <p>I, (Full Name), hereby declare and agree to the following during my stay at <strong>Gopal's Paying Guest Services (GPGS)</strong>.</p>
                <p><strong>Note</strong> : Here after below we are using the abbreviation of Gopal's Paying Guest Services as <strong>GPGS</strong></p>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold">Rules & Regulations</h5>
                    <ul className="list-disc pl-6">
                      <li>I have read, understood and agreed to abide by all the rules, terms and conditions of GPGS.</li>
                      <li>I understand that violation of the rules may lead to penalties or termination of my stay without refund.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold">Rent & Payments</h5>
                    <ul className="list-disc pl-6">
                      <li>I understand that the booking amount is non-refundable.</li>
                      <li>I agree to pay rent, electricity, parking charges*, previous due*, and other charges* on time (i.e. 1st to 3rd of every month). From 4th of every month the late fee of Rs.50 per day will be applied till the complete payment is received.</li>
                      <li>I understand that the AC Electricity bill will be calculated as per the AC consumption data provided by everyone in that room through the google sheet created and shared by GPGS. Even if one person is not cooperating to maintain the required data then GPGS have no choice but to divide the AC bill amount equally among everyone in that room.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold">Code of Conduct</h5>
                    <ul className="list-disc pl-6">
                      <li>I will not engage in activities prohibited by the management, including smoking, consuming alcohol, using drugs, playing loud music, and I will always maintain good behavior with the neighborhood.</li>
                      <li>I will provide one month prior written notice only. I also understand the rent is applicable for next one month from the date I have given the notice even if I stay or not.</li>
                      <li>I understand that the Full & Final (FNF) settlement amount will be processed after the PG facility is vacated with proper handover and it will take three working days as the FNF settlement report goes through an approval process and requires time, I will take care not pressurize the management unnecessarily.</li>
                      <li>Entry and Exit after 11:00 PM (IST) is not allowed, except for professionals working in the second shift and in such cases in writing it should be communicated.</li>
                      <li>I will maintain respectful behavior with fellow residents and GPGS team at all times and will not get involved in fights (verbal/physical) with anyone and it may lead to stay termination.</li>
                      <li>I understand the GPGS team is not responsible for handling my luggage during joining, shifting, or vacating the PG facility.</li>
                      <li>I will not bring unauthorized visitors and it may lead to stay termination.</li>
                      <li>I understand the uncleaned utensils or unattended items and expired products will be disposed of during our regular routine inspections.</li>
                      <li>I understand that the management will not be responsible for any loss, theft, or damage to my personal belongings at the PG facility. I am advised not to keep any valuables and important items in the PG facility.</li>
                      <li>I understand that I am responsible for my personal belongings. I will keep all items properly in the wardrobe and on the bed so that the GPGS team can easily carry out housekeeping work on a daily basis.</li>
                      <li>I understand that in case of any misconduct, indiscipline or violation of GPGS policies, the fine amount will be One Month rent starting from that date and immediate eviction from the PG Property.</li>
                      <li>I understand that any legal disputes or related expenses arising from such misconduct shall be fully borne by me.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold">Maintenance and Housekeeping Concerns</h5>
                    <ul className="list-disc pl-6">
                      <li>I will raise tickets for maintenance and housekeeping related concerns through the GPGS Application. I will not make any verbal communications to the GPGS team.</li>
                      <li>I understand certain maintenance activities are dependent on external vendors so the fixes may take time and I will keep practical expectations from GPGS regarding services.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold">Medical & Safety Disclaimer</h5>
                    <ul className="list-disc pl-6">
                      <li>I declare that I am medically and mentally fit to stay at the PG.</li>
                      <li>I will inform the management of any health conditions during my stay.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold">Legal & Acknowledgment</h5>
                    <ul className="list-disc pl-6">
                      <li>I declare that I have no criminal background or pending legal cases.</li>
                      <li>I confirm that the above is true to the best of my knowledge. I agree to comply with all GPGS rules and understand that violation may lead to immediate eviction without refund.</li>
                      <li>All this is to serve you better but we also need full cooperation from you.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Checkbox and Buttons */}
          <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl sticky bottom-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-5 h-5 accent-slate-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">
                  I have read and agree to all the Terms & Conditions
                </span>
              </label>

              <div className="flex gap-3">
                {/* <button
                  onClick={handleClose}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button> */}
                <button
                  onClick={handleAccept}
                  disabled={!isAgreed}
                  className={`px-8 py-2.5 rounded-lg font-semibold transition-all ${
                    isAgreed
                      ? 'theme-btn shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementPopup;