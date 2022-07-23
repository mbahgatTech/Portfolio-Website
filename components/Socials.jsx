import Image from 'next/image';
import styles from '../styles/Socials.module.css';

const Socials = () => {
    return (
        <>
            <div className={styles.social}>
                <a href='https://github.com/mbahgatTech'>
                    <Image 
                        src='/images/github.svg'
                        height={30}
                        width={30}
                    />
                </a>
            </div>

            <div className={styles.social}>
                <a href='https://www.linkedin.com/in/mazen-bahgat/'>
                    <Image 
                        src='/images/linkedin.svg'
                        height={30}
                        width={30}
                    />
                </a>
            </div>
        </>
    );
}

export default Socials;