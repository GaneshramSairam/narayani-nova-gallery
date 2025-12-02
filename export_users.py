import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
from datetime import datetime

# Use the full path to your Firebase key file
cred = credentials.Certificate('C:\\Users\\LENOVO\\.gemini\\antigravity\\scratch\\narayanis-nova-gallery\\nova-gallery-firebase-adminsdk-fbsvc-a0f99effc1.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://nova-gallery-default-rtdb.asia-southeast1.firebaseatabase.app'
})

ref = db.reference('users')
users_data = ref.get()

if users_data:
    users_list = []
    for user_id, user_info in users_data.items():
        users_list.append({
            'User ID': user_id,
            'Email': user_info.get('email', ''),
            'Name': user_info.get('name', ''),
            'Phone': user_info.get('phone', ''),
            'Total Spent': user_info.get('totalSpent', 0),
            'Created At': user_info.get('createdAt', ''),
            'Last Login': user_info.get('lastLogin', '')
        })
    
    df = pd.DataFrame(users_list)
    filename = f'users_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    df.to_excel(filename, index=False)
    print(f"✅ Exported {len(users_list)} users to {filename}")
else:
    print("❌ No users found in database")
