import cv2


def detect_face(image):
    if image is None:
        print("Image not found or path is incorrect")
        return
    
    image = cv2.imread(image)
    # Convert to grayscale
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # cv2.imshow('image', image_gray)

    # Load the Haar Cascade classifier
    face_detector = cv2.CascadeClassifier("Face_Detection/haarcascade_frontalface_default.xml")
    
    # Detect faces in the image
    faces = face_detector.detectMultiScale(image_gray)
    
    # Print the coordinates of detected faces
    # print(len(faces))
    if len(faces) >0:
        return True
    else:
        return False


detect_face("Face_Detection/img1.png")

cv2.waitKey(0)

