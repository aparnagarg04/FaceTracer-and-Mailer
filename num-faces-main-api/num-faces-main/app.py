from ultralytics import YOLO
import cv2 
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app)


Facemodel = YOLO('yolov8n-face.pt')


def count_Faces(path):
  face_result = Facemodel(path)
 
  image = cv2.imread(path)
  for i in face_result:
    par = i.boxes
    cnt=0

    for j in par:
      cnt+=1
  
 
  return cnt

@app.route('/detect_faces', methods=['POST'])
def detect_faces():
        
    file = request.files['file']
       
    # Save the uploaded file
    # file_path = '1.png'
    img_path="images/"+file.filename
    file.save(img_path)

    print("work")

    # Count the number of faces detected
    num_faces =count_Faces(img_path)
    os.remove(img_path)
    # Return the number of faces detected
    return jsonify({'num_faces': num_faces})

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
