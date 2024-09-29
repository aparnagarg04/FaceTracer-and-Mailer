import psycopg2
from PIL import Image
from imgbeddings import imgbeddings
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import warnings
import embeddings
from datetime import datetime

app = Flask(__name__)
CORS(app)

def create_embeddings(path):
    ibed = imgbeddings()
    img =  Image.open(path)
    # Calculate the embeddings
    embedding = ibed.to_embeddings(img)
    
    # Convert embedding to a string to store in MySQL
    embedding_str = embedding[0].tolist()
    return embedding_str


@app.route('/register', methods=['POST'])
def register():
    if(request.form['name']):
        print("ueywugc")
    else:
        print("dhc")
    
    warnings.filterwarnings("ignore")
    name = request.form['name']
    mobile = request.form['mobile']
    email = request.form['email']
    file1 = request.files['file']
    
    img_path="embeddings/"+file1.filename
    file1.save(img_path)
   
    # Convert embedding to a string to store in MySQL
    embedding_str = create_embeddings(img_path)
    print(embedding_str)


    uri = "postgres://avnadmin:AVNS_He2AeIl9fa-_M4S5G1X@image-postgres-hackedc2-v1.i.aivencloud.com:24220/defaultdb?sslmode=require"
    conn = psycopg2.connect(uri)
    print(conn)
    cur = conn.cursor()


# Iterate over images in the stored-faces directory
    # Open the image
    # img_loc = os.path.join("Photos/Cropped_User_Img/",filename)
    img = Image.open(img_path)
    base_name, _ = os.path.splitext(img_path)

    # with open(img_path, "rb") as f:
    #     photo_data = f.read()
    
    Name = name
    Email = email
    phone_number = mobile
    current_datetime = datetime.now()
    joined = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
    entries = 888
   
    
    sql_query = """
    INSERT INTO users ( name, email, phonenumber,entries, joined,embedding_str) 
    VALUES (%s, %s, %s, %s, %s,%s);
    """

# Define the values to insert into the table
    values = ( Name, Email, phone_number,entries, joined,embedding_str)

# Execute the parameterized query
    cur.execute(sql_query, values)
    
    # print()
    # break

# Commit changes
    conn.commit()

    # Close connection
    cur.close()
    jp = conn.cursor()
    jp.execute("SELECT userid, phonenumber from users;")
    row = jp.fetchall()
    for i in row:
        print(i)
    return jsonify({'num_faces': "done"})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True,port=5004)