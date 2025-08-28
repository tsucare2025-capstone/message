import {useState} from 'react'
import useChatStore from '../store/useChatStore'
import { SendIcon } from 'lucide-react'

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const {sendMessage, selectedUser} = useChatStore()

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if(!message.trim()) return;
    
    console.log('Attempting to send message to:', selectedUser);
    
    try {
      await sendMessage({
        text: message.trim(),
        receiverId: selectedUser,
      })

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  
  return (
    <form onSubmit={handleSendMessage} className="flex flex-col">
      <div className="flex items-center gap-2 w-full">
        <input 
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-3xl resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        
        <button 
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!message.trim()}
        >
          <SendIcon className="w-4 h-4 text-red-900" />
        </button>
      </div>
    </form>
  )
}

export default MessageInput