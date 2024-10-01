# This code works best when I took mp,fm,pm and kj, added the margin in cropping and in the current version added the threshold on the similarity and also the email extarction

from imgbeddings import imgbeddings
import os
import cv2
import warnings
from ultralytics import YOLO
import psycopg2
from PIL import Image
# from email_integeration import send_single_img_to_mail
import smtplib , ssl
import getpass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.utils import formatdate
from flask_cors import CORS
from flask import Flask,request,jsonify

app = Flask(__name__)
CORS(app)


def send_single_img_to_mail(recievers,path):
  for reciever in recievers:
    msg = MIMEMultipart()

    msg['To'] = reciever
    msg['From'] = sender
    msg['Subject'] = 'Photo Attachment'

    msg_ready = MIMEText('hi mime', 'plain')

    image_open = open(path, 'rb').read()
    image_ready = MIMEImage(image_open,'jpg')

  #   image_open_1 = open(path1, 'rb').read()
  #   image_ready_1 = MIMEImage(image_open_1,'jpg')
    msg.attach(msg_ready)
    msg.attach(image_ready)
  #   msg.attach(image_ready_1)


    context_data = ssl.create_default_context()

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender, password)
        server.sendmail(sender, reciever, msg.as_string())

    print(f"Email sent successfully {reciever}!")


@app.route('/sendphoto',methods=['POST'])
def sendphoto():
    email_list_to_send = []

    file = request.files['file']
    warnings.filterwarnings("ignore")
    img_path='sendphoto/'+file.filename
    file.save(img_path)
    image = cv2.imread(img_path)
    face_result = Facemodel(img_path)
    for i in face_result:
        # print(f"i is {i}")
        par = i.boxes
        cnt=0
        for j in par:
            # print(f"conf of j is is {j.conf[0]}")
            if j.conf[0]>0.65:
                x1,y1,x2,y2=j.xyxy[0]
                x1,y1,x2,y2= int(x1),int(y1),int(x2),int(y2)
                top_right = (x1,y1)
                bottom_left = (x2,y2)
                h,w = y2-y1,x2-x1
                cnt+=1
                color = (0, 255, 0)  # Define the color of the rectangle (in BGR format, here it's green)
                thickness = 2  # Define the thickness of the rectangle's border

                
                # Calculate the new coordinates with an additional 10% margin
                x_margin = int((bottom_left[0] - top_right[0]) * 0.1)
                y_margin = int((bottom_left[1] - top_right[1]) * 0.1)

                new_top_right = (top_right[0] - x_margin, top_right[1] - y_margin)
                new_bottom_left = (bottom_left[0] + x_margin, bottom_left[1] + y_margin)

                # Crop the image
                cropped_image = image[new_top_right[1]:new_bottom_left[1], new_top_right[0]:new_bottom_left[0]]

                cv2.rectangle(image,new_top_right, new_bottom_left, color, thickness)

                # Add text
                text = f"Face_{cnt}"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.5
                text_color = (255, 0, 0)  # Blue color (BGR format)
                text_thickness = 1
                text_org = (new_top_right[0] - 10, new_bottom_left[1] - 10)  # Adjust text position

                # cv2.putText(image, text, text_org, font, font_scale, text_color, text_thickness)

                os.makedirs("save_dir_1", exist_ok=True)
                filename = f'CroppedImage_{cnt}.png'
                cv2.imwrite(os.path.join("save_dir_1", filename), cropped_image)

                ibed = imgbeddings()
                img = Image.fromarray(cropped_image)
            # Calculate the embeddings
                embedding = ibed.to_embeddings(img)
                # Convert embedding to a string to store in MySQL
                embedding_str = embedding[0].tolist()
                # print(embedding_str)
                uri = "postgres://avnadmin:AVNS_He2AeIl9fa-_M4S5G1X@image-postgres-hackedc2-v1.i.aivencloud.com:24220/defaultdb?sslmode=require"
                conn = psycopg2.connect(uri)
                cur = conn.cursor()
                string_representation = "["+ ",".join(str(x) for x in embedding_str) +"]"
            #     cur.execute("SELECT * FROM user_table_rahul ")
                # cur.execute("SELECT USER_ID,filename, mobile_number FROM user_table_rahul ORDER BY embedding_str <-> %s limit 1;", (string_representation,))
                cur.execute("SELECT email, phonenumber,embedding_str <-> %s as similarity FROM users where embedding_str <-> %s < 15 ORDER BY similarity limit 1 ;", (string_representation,string_representation))
                
                rows = cur.fetchall()
                if not rows:
                    # print("No matched row")
                    pass
                
                else:
                    for row in rows:
                    # display(Image(filename="stored-faces/"+row[0]))
                        print(row)
                        reciever_email = row[0]
                        email_list_to_send.append(reciever_email)
                        print(f"Reciever_Email is {reciever_email} is added in the list")
                # print("nextline")
                
    send_single_img_to_mail(email_list_to_send,img_path)
    filename = f'CroppedImage_final.png'
    cv2.imwrite(os.path.join("save_dir_1", filename), image)
    return jsonify({'fone':'done'})

       
if __name__ == '__main__':
    app.run(debug=True, port=5002)