import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def establish_connection():
    try:
        uri = "postgres://avnadmin:AVNS_6PI6a3q70NJjYxOdhE5@relational-v2-hackedc2-v1.k.aivencloud.com:24220/defaultdb?sslmode=require"
        conn = psycopg2.connect(uri)
        return conn
    except Exception as e:
        print(f"Exception Occurred: {e}")
        return None

@app.route('/fetch_photo_Urls', methods=['GET'])
def fetch_photo_Urls():
    conn = establish_connection()
    if conn is None:
        return jsonify({"error": "Failed to connect to the database"}), 500
    
    try:
        cur = conn.cursor()
        event_id = request.args.get('Event_Id')
        user_id = request.args.get('User_Id')
        
        if not event_id or not user_id:
            return jsonify({"error": "Event_Id and User_Id are required"}), 400
        
        user_event_mapping_query = """
            SELECT User_Event_Mapping_Id 
            FROM user_event_mapping_table 
            WHERE Event_Id = %s AND User_Id = %s
        """
        cur.execute(user_event_mapping_query, (event_id, user_id))
        row = cur.fetchone()
        
        if row is None:
            return jsonify({"error": "No User_Event_Mapping_Id found for corresponding User_Id and Event_Id"}), 404
        
        user_event_mapping_id = row[0]
        
        fetch_photo_ids = """
            SELECT photo_id 
            FROM tagging_table 
            WHERE User_Event_mapping_id = %s
        """
        cur.execute(fetch_photo_ids, (user_event_mapping_id,))
        photo_ids = cur.fetchall()
        
        if not photo_ids:
            return jsonify({"photo_urls": []}), 200
        
        photo_urls = []
        fetch_photo_url = "SELECT Url FROM photos_upload_em_table WHERE Photo_Id = %s"
        
        for photo_id in photo_ids:
            cur.execute(fetch_photo_url, (photo_id[0],))
            photo_url = cur.fetchone()
            if photo_url:
                photo_urls.append(photo_url[0])
        
        return jsonify({"photo_urls": photo_urls}), 200
    
    except Exception as e:
        print(f"Exception Occurred: {e}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True,port=5002)
