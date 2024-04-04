import java.util.*;
public class code{
    public static void main(String[] args)
    {
        Scanner sc=new Scanner(System.in);
        int num=sc.nextInt();
        int n=sc.nextInt();
        int arr[]=new int[n];
        ArrayList<Integer> list=new ArrayList<>();
        for(int i=0;i<n;i++)
        {
            int val=sc.nextInt();
            list.add(val);
        }

        for(int i=num;i<Integer.MAX_VALUE;i++)
        {
            if(isValid(i,list))
            {
                System.out.print(i);
                break;
            }
        }
    }
    public static boolean isValid(int n,ArrayList<Integer> list)
    {
        while(n!=0)
        {
            if(list.contains(n%10))
            {
                return false;
            }
            n=n/10;
        }
        return true;
    }
}