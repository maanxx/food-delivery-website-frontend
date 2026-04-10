import React from "react";
import classNames from "classnames/bind";
import { Container } from "@mui/material";

import styles from "./BestSeller.module.css";
import { Carousel } from "@components/index";

const cx = classNames.bind(styles);

function BestSeller() {
  const items = [
    "/images/dishes/burgers/2-mieng-b_-burger-b_-n_ng-whopper_3.jpg",
    "/images/dishes/burgers/11-burger-b_-th_t-heo-x_ng-kh_i_1.jpg",
    "/images/dishes/noodles/mi-bolognese-300x300.jpg",
    "/images/dishes/noodles/mi-y-pho-mai-300x300.jpg",
    "/images/dishes/pizza/Pepperoni-feast-Pizza-Xuc-Xich-Y.jpg",
    "/images/dishes/pizza/Pizza-Dam-Bong-Dua-Kieu-Hawaii-Hawaiian.jpg",
    "/images/dishes/pizza/Pizza-Hai-San-Xot-Mayonnaise-Ocean-Mania.jpg",
    "/images/dishes/rices/35.RM1CmBBQTender.png",
    "/images/dishes/rices/36.RM2CmBBQPopcorn.png",
    "/images/dishes/rices/38.RM4CmGTNM.png",
  ];

  return (
    <div className={cx("wrapper")}>
      <Container maxWidth="lg">
        <div className={cx("title")}>
          <h1>Món Bán Chạy Nhất</h1>
          <h6>
            Những món ăn được yêu thích và chọn lựa nhiều nhất bởi thực khách.
          </h6>
        </div>

        <Carousel items={items} active={0} />
      </Container>

      <Container maxWidth="lg">
        <div className={cx("title")}>
          <h1>Ưu Đãi Hôm Nay</h1>
          <h6>
            Chọn ngay món ngon với giá cực ưu đãi – chỉ áp dụng trong hôm nay!
          </h6>
        </div>

        <div className={cx("offer-today")}>
          <div className={cx("table")}>
            <table>
              <tbody>
                <tr>
                  <td className={cx("column-l")}>
                    <h3>Burger Bò Nướng Than Kiểu Mỹ</h3>
                    <h6>
                      Ba lớp bò nướng than thơm lừng kết hợp phô mai, thịt xông
                      khói giòn và rau tươi mát.
                    </h6>
                  </td>
                  <td className={cx("red-text")}>79.000₫</td>
                </tr>

                <tr>
                  <td className={cx("column-l")}>
                    <h3>Pizza Siêu Topping Hải Sản 4 Mùa</h3>
                    <h6>
                      Đế pizza giòn rụm phủ đầy tôm, mực, cua và phô mai tan
                      chảy, mang hương vị biển cả suốt 4 mùa.
                    </h6>
                  </td>
                  <td className={cx("red-text")}>355.000₫</td>
                </tr>

                <tr>
                  <td className={cx("column-l")}>
                    <h3>Cơm Gà Nướng BBQ Không Xương</h3>
                    <h6>
                      Gà nướng BBQ đậm vị, không xương, ăn kèm với cơm nóng và
                      rau củ tươi.
                    </h6>
                  </td>
                  <td className={cx("red-text")}>39.000₫</td>
                </tr>

                <tr>
                  <td className={cx("column-l")}>
                    <h3>Mì Ý Sốt Carbonara</h3>
                    <h6>
                      Mì Ý sốt kem béo ngậy kết hợp với thịt xông khói, phô mai
                      Parmesan và trứng gà tươi.
                    </h6>
                  </td>
                  <td className={cx("red-text")}>155.000₫</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={cx("today-img")}>
            <img
              src={require("@assets/images/banner/bestseller_banner.png")}
              alt="Banner ưu đãi hôm nay"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default BestSeller;
