# How To Set Up Environment
1. Install PyCharm
2. Navigate to project folder in command prompt
3. Use virtualenv to create a Python environment, then activate it
4. Download Helium and put it in a convenient place (like "C:\Tools")
5. Add PYTHONPATH to your Windows environment vars with the full path of where you put Helium
6. In PyCharm, go to File > Settings > Project > ProjectInterpreter in PyCharm
7. Set the interpreter to your envName\Scripts\python.exe
8. Click the green + on the right side of the window and install the browsermobproxy package. Note this is just the python interface, you still need the browsermob executable!
9. Download browsermobproxy and put in a convenient place (like "C:\Tools")
10. Go into pmct.py and change BROWSERMOB_LOCATION to the full filepath to the "browsermob-proxy" file