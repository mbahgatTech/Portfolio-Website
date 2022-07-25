import Image from 'next/image';
import styles from '../styles/Profile.module.css';
import { Fragment } from 'react';

const Profile = () => {
    return (
        <>
            <div>
                <Image 
                    src='/images/profile.jpg'
                    alt='Mazen Bahgat'
                    width={144}
                    height={144}
                    className={styles.profile}
                /> 
                <h1>Mazen Bahgat</h1>
                <Fragment>Full Stack Mobile and Web Application Developer</Fragment>
            </div>
            <div className={styles.learn}>
                <p className={styles.learnTex}>Learn More About What I Do</p>
                <Image
                    src='/images/arrows.svg'
                    height={16}
                    width={15}
                />
            </div>
        </>
    );
}

export default Profile;