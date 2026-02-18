public class MyProgram {
    public double power;
    public double k;
    public double distance;

    public void setK(double k) {
        this.k = k;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public double getPower() {
        return power;
    }
    public void calculatePower() {
        power = -1 * distance * k;
    }
    public static void main(String[] args) {
        MyProgram program = new MyProgram();
    }
}