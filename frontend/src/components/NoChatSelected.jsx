import { MessageCircle } from 'lucide-react';

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">No chat selected</h1>
          <p className="text-gray-500">Select a user to start chatting</p>
        </div>
    </div>
  )
}

export default NoChatSelected